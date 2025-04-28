using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ResumeAPI.Utils;

public record ResumePart
{
    public required int LineNumber { get; set; }
    public required string Text { get; set; }
}

public static class WordProcessingDocumentUtils
{
    public static ResumePart[] GetResumeParts(this WordprocessingDocument doc)
    {
        var parts = new List<ResumePart>();
        var lineCount = 0;

        var body = doc.MainDocumentPart.Document.Body;

        foreach (Paragraph para in body.Elements<Paragraph>())
        {
            foreach (Run run in para.Elements<Run>())
            {
                foreach (Text text in run.Elements<Text>())
                {
                    parts.Add(new ResumePart { Text = text.Text, LineNumber = lineCount });
                    lineCount++;
                }
            }
        }

        return parts.ToArray();
    }

    public static string GetResumeText(this WordprocessingDocument doc)
    {
        var resumeTextBuilder = new StringBuilder();

        foreach (var part in doc.GetResumeParts().Where(p => p.Text.Length > 25))
        {
            resumeTextBuilder.AppendLine($" Line {part.LineNumber}: {part.Text} ");
        }

        return resumeTextBuilder.ToString();
    }
}
