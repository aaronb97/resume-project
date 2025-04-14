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

                    using var stream = file.OpenReadStream();
                    var s3Key = $"resumes/{Guid.NewGuid()}";

                    var putRequest = new PutObjectRequest
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = s3Key,
                        InputStream = stream,
                        ContentType = file.ContentType,
                        Metadata = { ["file-name"] = file.FileName },
                    };

                    await s3Client.PutObjectAsync(putRequest);

                    var documentRecord = new DocumentRecord
                    {
                        FileName = file.FileName,
                        S3Key = s3Key,
                        UploadedAt = DateTime.UtcNow,
                    };

                    db.Documents.Add(documentRecord);
                    await db.SaveChangesAsync();

                    return Results.Ok(new UploadResumeResponse { Id = documentRecord.Id });
                }
            )
            .DisableAntiforgery()
            .Produces<UploadResumeResponse>();

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
                    // Retrieve the document record from the database.
                    var documentRecord = await db.Documents.FindAsync(request.Id);
                    if (documentRecord == null)
                    {
                        return Results.NotFound("Document not found.");
                    }

                    // Download the DOCX file from S3 using the S3Key.
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
                    // Retrieve the document record from the database.
                    var documentRecord = await db.Documents.FindAsync(request.Id);
                    if (documentRecord == null)
                    {
                        return Results.NotFound("Document not found.");
                    }

                    // Download the DOCX file from S3.
                    var getRequest = new GetObjectRequest
                    {
                        BucketName = s3Settings.Value.BucketName,
                        Key = documentRecord.S3Key,
                    };

                    using var getResponse = await s3Client.GetObjectAsync(getRequest);

                    // Copy the S3 response stream into a MemoryStream for editing.
                    using var s3Stream = new MemoryStream();
                    await getResponse.ResponseStream.CopyToAsync(s3Stream);
                    s3Stream.Position = 0;

                    var editableStream = new MemoryStream();
                    await s3Stream.CopyToAsync(editableStream);
                    editableStream.Position = 0;

                    // Open the DOCX for editing.
                    using (var wordDoc = WordprocessingDocument.Open(editableStream, true))
                    {
                        var body = wordDoc.MainDocumentPart.Document.Body;
                        int currentLine = 0;

                        // Loop through every paragraph, run, and text element to update lines that match the recommendations.
                        foreach (var para in body.Elements<Paragraph>())
                        {
                            foreach (var run in para.Elements<Run>())
                            {
                                foreach (var text in run.Elements<Text>())
                                {
                                    // Check if there is a recommendation for the current line.
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

                        // Save changes to the document.
                        wordDoc.MainDocumentPart.Document.Save();
                    }

                    // Reset the stream position before returning.
                    editableStream.Position = 0;

                    // Return the updated file.
                    return Results.File(
                        editableStream,
                        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        "modified.docx"
                    );
                }
            )
            .DisableAntiforgery();

        return endpoints;
    }
}
