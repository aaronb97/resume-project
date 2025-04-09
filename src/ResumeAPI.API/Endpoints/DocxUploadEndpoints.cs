using Amazon.S3;
using Amazon.S3.Model;
using Microsoft.Extensions.Options;
using ResumeAPI.Models;

namespace ResumeAPI.Endpoints;

using System.IO;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;

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

                    // Ensure only DOCX files are processed
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

                    return Results.Ok(s3Key);
                }
            )
            .DisableAntiforgery();

        return endpoints;
    }
}
