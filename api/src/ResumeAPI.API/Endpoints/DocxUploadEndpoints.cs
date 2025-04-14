using System.Text;
using Amazon.S3;
using Amazon.S3.Model;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Options;
using ResumeAPI.Models;
using ResumeAPI.Services;

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

        // This is a post request because the job description is too long for a get request
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

                    // Copy the S3 response stream into an expandable MemoryStream.
                    using var s3Stream = new MemoryStream();
                    await getResponse.ResponseStream.CopyToAsync(s3Stream);
                    s3Stream.Position = 0;

                    var editableStream = new MemoryStream();
                    await s3Stream.CopyToAsync(editableStream);
                    editableStream.Position = 0;

                    var resumeTextBuilder = new StringBuilder();
                    var lineCount = 0;

                    using (
                        WordprocessingDocument wordDoc = WordprocessingDocument.Open(
                            editableStream,
                            true
                        )
                    )
                    {
                        var body = wordDoc.MainDocumentPart.Document.Body;

                        foreach (Paragraph para in body.Elements<Paragraph>())
                        {
                            foreach (Run run in para.Elements<Run>())
                            {
                                foreach (Text text in run.Elements<Text>())
                                {
                                    if (text.Text.Length > 25)
                                    {
                                        resumeTextBuilder.AppendLine(
                                            $" Line {lineCount}: {text.Text} "
                                        );
                                    }

                                    lineCount++;
                                }
                            }
                        }
                    }

                    var recommendations = await aiService.GetRecommendations(
                        request.JobDescription,
                        resumeTextBuilder.ToString()
                    );

                    return Results.Ok(recommendations);
                }
            )
            .DisableAntiforgery()
            .Produces<ResumeAiResponse>();

        return endpoints;
    }
}
