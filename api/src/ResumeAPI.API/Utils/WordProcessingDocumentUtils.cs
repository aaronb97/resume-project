using System.Text;
using DocumentFormat.OpenXml.Packaging;
using DocumentFormat.OpenXml.Wordprocessing;

namespace ResumeAPI.Utils;

public static class WordProcessingDocumentUtils
{
    public static string GetResumeText(this WordprocessingDocument doc)
    {
        var resumeTextBuilder = new StringBuilder();
        var lineCount = 0;

        var body = doc.MainDocumentPart.Document.Body;

        foreach (Paragraph para in body.Elements<Paragraph>())
        {
            foreach (Run run in para.Elements<Run>())
            {
                foreach (Text text in run.Elements<Text>())
                {
                    if (text.Text.Length > 25)
                    {
                        resumeTextBuilder.AppendLine($" Line {lineCount}: {text.Text} ");
                    }

                    lineCount++;
                }
            }
        }

        return resumeTextBuilder.ToString();
    }
}
