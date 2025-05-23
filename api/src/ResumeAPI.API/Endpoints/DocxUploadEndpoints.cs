using System.Security.Claims;
using System.Text.Json;
using Amazon.S3;
using Amazon.S3.Model;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using ResumeAPI.Contracts;
using ResumeAPI.Data;
using ResumeAPI.Services;
using ResumeAPI.Utils;

namespace ResumeAPI.Endpoints;

public static class DocxUploadEndpoints
{
    public static IEndpointRouteBuilder MapDocxUpload(this IEndpointRouteBuilder endpoints)
    {
        endpoints
            .MapPost("resumes", UploadResumeAsync)
            .RequireAuthorization()
            .DisableAntiforgery()
            .Produces<DocumentResponse>();

        endpoints
            .MapGet("resumes/{id:guid}", GetResumeAsync)
            .RequireAuthorization()
            .Produces<DocumentResponse>();

        endpoints
            .MapPatch("resumes/{id:guid}", PatchResumeAsync)
            .RequireAuthorization()
            .DisableAntiforgery()
            .Produces<DocumentResponse>();

        endpoints
            .MapGet("resumes/{id:guid}/recommendations", GetRecommendationsAsync)
            .RequireAuthorization()
            .DisableAntiforgery();

        endpoints
            .MapPost("resumes/processRecommendations", ProcessRecommendationsAsync)
            .RequireAuthorization()
            .DisableAntiforgery()
            .Produces(204);

        return endpoints;
    }

    private static async Task<IResult> UploadResumeAsync(
        IFormFile file,
        [FromForm] string jobDescription,
        [FromForm] string? userNotes,
        IAmazonS3 s3Client,
        IOptions<S3Settings> s3Settings,
        AppDbContext db
    )
    {
        if (file.Length == 0)
        {
            return Results.BadRequest("No file uploaded.");
        }

        if (string.IsNullOrWhiteSpace(jobDescription))
        {
            return Results.BadRequest("Job description is required.");
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

        var previewPutRequest = new PutObjectRequest
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
            JobDescription = jobDescription,
            UserNotes = userNotes ?? string.Empty,
        };

        db.Documents.Add(documentRecord);
        await db.SaveChangesAsync();

        return Results.Ok(
            new DocumentResponse
            {
                Id = documentRecord.Id,
                S3Key = s3Key,
                FileName = file.FileName,
                SignedUrl = signedUrl,
                JobDescription = jobDescription,
                UserNotes = userNotes ?? string.Empty,
                ResumeParts = [],
            }
        );
    }

    private static async Task<IResult> GetResumeAsync(
        Guid id,
        IAmazonS3 s3Client,
        IOptions<S3Settings> s3Settings,
        AppDbContext db
    )
    {
        var documentRecord = await db.Documents.FindAsync(id);
        if (documentRecord == null)
        {
            return Results.NotFound("Document not found.");
        }

        var getRequest = new GetObjectRequest
        {
            BucketName = s3Settings.Value.BucketName,
            Key = documentRecord.S3Key,
        };

        await using var s3Stream = new MemoryStream();
        using (var getResponse = await s3Client.GetObjectAsync(getRequest))
        {
            await getResponse.ResponseStream.CopyToAsync(s3Stream);
        }
        s3Stream.Position = 0;

        ResumePart[] resumeParts;
        using (var wordDoc = WordprocessingDocument.Open(s3Stream, false))
        {
            resumeParts = wordDoc.GetResumeParts();
        }

        return Results.Ok(
            new DocumentResponse
            {
                Id = documentRecord.Id,
                FileName = documentRecord.FileName,
                S3Key = documentRecord.S3Key,
                SignedUrl = documentRecord.SignedUrl,
                JobDescription = documentRecord.JobDescription,
                UserNotes = documentRecord.UserNotes,
                ResumeParts = resumeParts,
            }
        );
    }

    private static async Task<IResult> PatchResumeAsync(
        Guid id,
        UpdateDocumentRequest request,
        AppDbContext db
    )
    {
        var documentRecord = await db.Documents.FindAsync(id);
        if (documentRecord == null)
        {
            return Results.NotFound("Document not found.");
        }

        if (request.JobDescription is not null)
        {
            documentRecord.JobDescription = request.JobDescription;
        }

        if (request.UserNotes is not null)
        {
            documentRecord.UserNotes = request.UserNotes;
        }

        await db.SaveChangesAsync();

        return Results.Ok(
            new DocumentResponse
            {
                Id = documentRecord.Id,
                FileName = documentRecord.FileName,
                S3Key = documentRecord.S3Key,
                SignedUrl = documentRecord.SignedUrl,
                JobDescription = documentRecord.JobDescription,
                UserNotes = documentRecord.UserNotes,
                ResumeParts = [],
            }
        );
    }

    private static async Task GetRecommendationsAsync(
        Guid id,
        ClaimsPrincipal user,
        IAmazonS3 s3Client,
        IOptions<S3Settings> s3Settings,
        AppDbContext db,
        AiService aiService,
        HttpResponse response,
        bool mockData = false
    )
    {
        response.Headers.ContentType = "application/x-ndjson";

        var uid = user.FindFirstValue(ClaimTypes.NameIdentifier);
        if (string.IsNullOrEmpty(uid))
        {
            response.StatusCode = StatusCodes.Status401Unauthorized;
            await response.WriteAsync("{\"error\":\"Unauthorized.\"}\n");
            return;
        }

        var userRecord = await db.Users.FindAsync(uid);
        if (userRecord == null)
        {
            response.StatusCode = StatusCodes.Status500InternalServerError;
            await response.WriteAsync("{\"error\":\"User record missing.\"}\n");
            return;
        }

        var now = DateTimeOffset.UtcNow;
        var shouldRefillRegens = now - userRecord.LastGeneration >= TimeSpan.FromHours(8);

        if (userRecord.RemainingGenerations == 0 && !shouldRefillRegens)
        {
            response.StatusCode = StatusCodes.Status402PaymentRequired;
            return;
        }

        if (shouldRefillRegens)
        {
            userRecord.RemainingGenerations = Math.Max(10, userRecord.RemainingGenerations);
        }

        userRecord.RemainingGenerations -= 1;
        userRecord.LastGeneration = now;
        await db.SaveChangesAsync();

        if (mockData)
        {
            var json = JsonSerializer.Serialize(MockResumeRecommendations.Response) + "\n";
            const int chunkSize = 10;
            for (var i = 0; i < json.Length; i += chunkSize)
            {
                var chunk = json.Substring(i, Math.Min(chunkSize, json.Length - i));
                await response.WriteAsync(chunk);
                await response.Body.FlushAsync();
                await Task.Delay(20);
            }
            return;
        }

        var documentRecord = await db.Documents.FindAsync(id);
        if (documentRecord == null)
        {
            response.StatusCode = StatusCodes.Status404NotFound;
            await response.WriteAsync("{\"error\":\"Document not found.\"}\n");
            return;
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
        await foreach (
            var chunk in aiService.GetRecommendationsStream(
                documentRecord.JobDescription,
                documentRecord.UserNotes,
                wordDoc.GetResumeText()
            )
        )
        {
            await response.WriteAsync(chunk);
            await response.Body.FlushAsync();
        }
    }

    private static async Task<IResult> ProcessRecommendationsAsync(
        ProcessRecommendationsRequest request,
        IAmazonS3 s3Client,
        IOptions<S3Settings> s3Settings,
        AppDbContext db
    )
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
            ContentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            Metadata = { ["file-name"] = documentRecord.FileName },
        };
        await s3Client.PutObjectAsync(putRequest);

        var signedUrl = s3Client.GeneratePreSignedURL(
            s3Settings.Value.BucketName,
            previewKey,
            DateTime.UtcNow.AddDays(1),
            null
        );

        documentRecord.SignedUrl = signedUrl;

        db.Documents.Update(documentRecord);
        await db.SaveChangesAsync();

        return Results.NoContent();
    }
}
