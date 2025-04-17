using Amazon.S3;
using Amazon.S3.Model;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Options;
using ResumeAPI.Models;
using ResumeAPI.Services;
using ResumeAPI.Utils;

namespace ResumeAPI.Endpoints;

public static class DocxUploadEndpoints
{
    public static IEndpointRouteBuilder MapDocxUpload(this IEndpointRouteBuilder endpoints)
    {
        endpoints
            .MapPost(
                "resumes",
                async (
                    IFormFile file,
                    IAmazonS3 s3Client,
                    IOptions<S3Settings> s3Settings,
                    AppDbContext db
                ) =>
                {
                    if (file.Length == 0)
                    {
                        return Results.BadRequest("No file uploaded.");
                    }

                    if (Path.GetExtension(file.FileName)?.ToLower() != ".docx")
                    {
                        return Results.BadRequest("Only .docx files are allowed.");
                    }

                    using var fileStream = file.OpenReadStream();
                    using var memoryStream = new MemoryStream();
                    await fileStream.CopyToAsync(memoryStream);
                    var fileBytes = memoryStream.ToArray();

                    var s3Key = $"resumes/{Guid.NewGuid()}";
                    var previewKey = $"{s3Key}.preview";

                    var putRequest = new PutObjectRequest
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = s3Key,
                        InputStream = new MemoryStream(fileBytes),
                        ContentType = file.ContentType,
                        Metadata = { ["file-name"] = file.FileName },
                    };

                    var previewPutRequest = new PutObjectRequest()
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = previewKey,
                        InputStream = new MemoryStream(fileBytes),
                        ContentType = file.ContentType,
                        Metadata = { ["file-name"] = file.FileName },
                    };

                    await s3Client.PutObjectAsync(putRequest);
                    await s3Client.PutObjectAsync(previewPutRequest);

                    var signedUrl = s3Client.GeneratePreSignedURL(
                        s3Settings.Value.BucketName,
                        previewKey,
                        DateTime.UtcNow.AddDays(1),
                        null
                    );

                    var documentRecord = new DocumentRecord
                    {
                        FileName = file.FileName,
                        S3Key = s3Key,
                        UploadedAt = DateTime.UtcNow,
                        SignedUrl = signedUrl,
                    };

                    db.Documents.Add(documentRecord);
                    await db.SaveChangesAsync();

                    return Results.Ok(
                        new DocumentResponse
                        {
                            Id = documentRecord.Id,
                            S3Key = signedUrl,
                            FileName = file.FileName,
                            SignedUrl = signedUrl,
                        }
                    );
                }
            )
            .DisableAntiforgery()
            .Produces<DocumentResponse>();

        endpoints
            .MapGet(
                "resumes/{id:guid}",
                async (Guid id, AppDbContext db) =>
                {
                    var documentRecord = await db.Documents.FindAsync(id);
                    if (documentRecord == null)
                    {
                        return Results.NotFound("Document not found.");
                    }

                    return Results.Ok(
                        new DocumentResponse
                        {
                            Id = documentRecord.Id,
                            FileName = documentRecord.FileName,
                            S3Key = documentRecord.S3Key,
                            SignedUrl = documentRecord.SignedUrl,
                        }
                    );
                }
            )
            .Produces<DocumentResponse>();

        endpoints
            .MapPost(
                "resumes/recommend",
                async (
                    JobDescriptionRequest request,
                    IAmazonS3 s3Client,
                    IOptions<S3Settings> s3Settings,
                    AppDbContext db,
                    AiService aiService
                ) =>
                {
                    if (request.MockData)
                    {
                        return Results.Ok(MockResumeRecommendations.Response);
                    }

                    var documentRecord = await db.Documents.FindAsync(request.Id);
                    if (documentRecord == null)
                    {
                        return Results.NotFound("Document not found.");
                    }

                    var getRequest = new GetObjectRequest
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = documentRecord.S3Key,
                    };

                    using var getResponse = await s3Client.GetObjectAsync(getRequest);

                    using var s3Stream = new MemoryStream();
                    await getResponse.ResponseStream.CopyToAsync(s3Stream);
                    s3Stream.Position = 0;

                    var editableStream = new MemoryStream();
                    await s3Stream.CopyToAsync(editableStream);
                    editableStream.Position = 0;

                    using var wordDoc = WordprocessingDocument.Open(editableStream, true);

                    var recommendations = await aiService.GetRecommendations(
                        request.JobDescription,
                        wordDoc.GetResumeText()
                    );

                    return Results.Ok(recommendations);
                }
            )
            .DisableAntiforgery()
            .Produces<ResumeAiResponse>();

        endpoints
            .MapPost(
                "resumes/processRecommendations",
                async (
                    ProcessRecommendationsRequest request,
                    IAmazonS3 s3Client,
                    IOptions<S3Settings> s3Settings,
                    AppDbContext db
                ) =>
                {
                    var documentRecord = await db.Documents.FindAsync(request.Id);
                    if (documentRecord == null)
                    {
                        return Results.NotFound("Document not found.");
                    }

                    var getRequest = new GetObjectRequest
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = documentRecord.S3Key,
                    };

                    using var getResponse = await s3Client.GetObjectAsync(getRequest);
                    using var s3Stream = new MemoryStream();
                    await getResponse.ResponseStream.CopyToAsync(s3Stream);
                    s3Stream.Position = 0;

                    var editableStream = new MemoryStream();
                    await s3Stream.CopyToAsync(editableStream);
                    editableStream.Position = 0;

                    using (var wordDoc = WordprocessingDocument.Open(editableStream, true))
                    {
                        var body = wordDoc.MainDocumentPart.Document.Body;
                        int currentLine = 0;
                        foreach (var para in body.Elements<Paragraph>())
                        {
                            foreach (var run in para.Elements<Run>())
                            {
                                foreach (var text in run.Elements<Text>())
                                {
                                    var recommendation = request.Recommendations.FirstOrDefault(r =>
                                        r.LineNum == currentLine
                                    );
                                    if (recommendation != null)
                                    {
                                        text.Text = recommendation.Text;
                                    }
                                    currentLine++;
                                }
                            }
                        }
                        wordDoc.MainDocumentPart.Document.Save();
                    }

                    editableStream.Position = 0;
                    var previewKey = documentRecord.S3Key + ".preview";
                    var putRequest = new PutObjectRequest
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = previewKey,
                        InputStream = editableStream,
                        ContentType =
                            "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        Metadata = { ["file-name"] = documentRecord.FileName },
                    };
                    await s3Client.PutObjectAsync(putRequest);

                    return Results.NoContent();
                }
            )
            .DisableAntiforgery()
            .Produces(204);

        return endpoints;
    }
}
