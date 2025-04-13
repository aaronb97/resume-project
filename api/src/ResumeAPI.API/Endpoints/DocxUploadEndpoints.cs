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
                    AppDbContext db,
                    AiService aiService
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

                    var resumeTextBuilder = new StringBuilder();
                    var lineCount = 0;

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

                        // Save changes to the document.
                        wordDoc.MainDocumentPart.Document.Save();
                    }

                    // Reset the stream position before returning it.
                    editableStream.Position = 0;

                    var summary = await aiService.GetRecommendations(
                        $"\nAbout the job\n\nAbout North (www.north.cloud)\n\nThe public cloud is home to $200B+ in annual technology spend, yet 95% of it is still managed with credit cards and spreadsheets. With AI accelerating cloud growth towards $1T by 2030, businesses need better tools to manage, optimize, and scale their cloud investments.\n\n\nAt North, we’re building the next-generation cloud spend management platform, giving companies clarity, control, and automation over their cloud finances. Our mission is to help organizations take charge of their cloud costs and maximize efficiency in the AI-driven era.\n\n\nBacked by top-tier investors and trusted by leading customers like Brave, StayNTouch, and DataBiologics, we’re assembling a world-class team to redefine how businesses manage cloud spend. If you’re looking for impact, growth, and the opportunity to shape the future of cloud finance, North is the place to be.\n\n\nAbout the role\n\nWe’re looking for a UI Engineer to join our team at North on a six-month contract and take the lead in designing and developing beautiful, high-performance user interfaces. You'll play a key role in shaping our web application, ensuring it’s both visually stunning and highly functional.\n\n\nThis is a hands-on role—perfect for someone who thrives in a fast-paced environment, has a strong eye for design, and knows how to bring intuitive, user-friendly experiences to life. If you're passionate about frontend development, love crafting sleek UI components, and want to make a big impact at a growing company, we’d love to hear from you!\n\n\nWhat you’ll do\n\n\nFrontend Development (80%)\n\n    Build responsive, high-performance interfaces using SvelteKit.\n    Implement reusable components and optimize frontend performance.\n    Collaborate with backend developers to integrate APIs and ensure seamless functionality.\n    Maintain code quality through testing, reviews, and best practices.\n\nUI Design (20%)\n\n    Use Figma to create UI components that align with design and usability standards.\n    Develop wireframes and prototypes to communicate interaction flows when needed.\n    Apply user feedback to refine and enhance the interface.\n\n\nWhat you’ll need\n\n\n    Must provide a portfolio or website with your application.\n    Frontend expertise: 2+ years of experience with SvelteKit or 3+ years with React, Vue, or similar frameworks, plus a strong grasp of TailwindCSS.\n    Hands-on experience with SSR: Understanding of server-side rendering and performance optimization best practices.\n    Proficiency in modern development workflows: Comfortable with Git, CI/CD pipelines, and version control best practices.\n    UI sensibility: Familiarity with Figma and the ability to translate designs into polished, user-friendly interfaces.\n    Attention to detail: A strong portfolio demonstrating clean, user-centered frontend development.\n\n\nNice to haves\n\n\n    Experience working in agile teams.\n    Experience with data charting tools (such as Chart.js).\n    Experience with Firebase (Authentication).\n    Experience with Slack API.\n    Familiarity with accessibility standards and best practices.\n    Understanding of web analytics and user behavior tracking tools.\n\n\nWork location\n\nThis is a fully remote or hybrid role in our New York office (in West Village). \n\n\nCompensation\n\nThe pay for this role is $45-55/hour. Actual compensation may vary based on a candidate's qualifications, skills, and experience. This role also comes with the opportunity to transition into a full-time position based on performance and business needs.\n\n\nJoin us!\n\nIf you’re a UI Engineer who loves building sleek, high-performance interfaces, optimizing frontend experiences, and bringing designs to life, we’d love to hear from you. Apply today!\n",
                        resumeTextBuilder.ToString()
                    );

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
}
