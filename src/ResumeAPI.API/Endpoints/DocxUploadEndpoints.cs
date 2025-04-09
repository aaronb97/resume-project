using Amazon.S3;
using Amazon.S3.Model;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;
using Microsoft.Extensions.Options;
using ResumeAPI.Models;

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

                    return Results.Ok(s3Key);
                }
            )
            .DisableAntiforgery();

        endpoints
            .MapGet(
                "resumes/{id:guid}",
                async (
                    Guid id,
                    IAmazonS3 s3Client,
                    IOptions<S3Settings> s3Settings,
                    AppDbContext db
                ) =>
                {
                    // Retrieve the document record from the database.
                    var documentRecord = await db.Documents.FindAsync(id);
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

                    // Open the DOCX for editing.
                    using (
                        WordprocessingDocument wordDoc = WordprocessingDocument.Open(
                            editableStream,
                            true
                        )
                    )
                    {
                        var body = wordDoc.MainDocumentPart.Document.Body;

                        // Iterate through every paragraph, every run, and every text element.
                        foreach (Paragraph para in body.Elements<Paragraph>())
                        {
                            Console.WriteLine("----");
                            foreach (Run run in para.Elements<Run>())
                            {
                                foreach (Text text in run.Elements<Text>())
                                {
                                    Console.WriteLine(text.Text);
                                    text.Text = text.Text.Replace(
                                        "proven experience",
                                        "some other text blah blah blah"
                                    );
                                }
                            }
                        }

                        // Save changes to the document.
                        wordDoc.MainDocumentPart.Document.Save();
                    }

                    // Reset the stream position before returning it.
                    editableStream.Position = 0;

                    // Return the modified DOCX file as a download.
                    return Results.File(
                        editableStream,
                        contentType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                        fileDownloadName: "modified.docx"
                    );
                }
            )
            .DisableAntiforgery();

        return endpoints;
    }

    // Helper method that replaces every alphabetical character in a string with a random letter
    // matching the case of the original character.
    private static string ReplaceAlphabeticalWithRandom(string input)
    {
        if (string.IsNullOrEmpty(input))
        {
            return input;
        }

        var result = new char[input.Length];

        for (int i = 0; i < input.Length; i++)
        {
            char c = input[i];
            if (char.IsLetter(c))
            {
                // Use Random.Shared (available in .NET 6+). Alternatively, you could use a static Random instance.
                result[i] = char.IsUpper(c)
                    ? (char)('A' + Random.Shared.Next(26))
                    : (char)('a' + Random.Shared.Next(26));
            }
            else
            {
                result[i] = c;
            }
        }

        return new string(result);
    }
}
