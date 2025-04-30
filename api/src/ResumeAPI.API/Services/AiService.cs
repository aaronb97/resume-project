using Microsoft.SemanticKernel.Connectors.OpenAI;
using ResumeAPI.Contracts;

namespace ResumeAPI.Services;

using System.Text.Json;
using Microsoft.SemanticKernel;

#pragma warning disable SKEXP0010

public class AiService
{
    private readonly Kernel _kernel;

    public AiService(IConfiguration configuration)
    {
        _kernel = Kernel
            .CreateBuilder()
            .AddOpenAIChatCompletion(
                modelId: "gpt-4.1-mini",
                apiKey: configuration["OpenAI:ApiKey"]!
            )
            .Build();
    }

    public async IAsyncEnumerable<string> GetRecommendationsStream(
        string jobDescription,
        string userNotes,
        string resume
    )
    {
        var executionSettings = new OpenAIPromptExecutionSettings()
        {
            ResponseFormat = typeof(ResumeAiResponse),
        };

        var prompt =
            @$"
You are the backend for a saas tool to help fine tune resumes for job descriptions. The user will upload a docx file and receive your recommendations which will be inserted into the docx file.

Please generate recommendations to improve this resume. 
Consider ATS software and matching keywords or removing irrelevant skills that do not appear in the resume.
Do not change employment dates or job titles or section headers. 
Do not add new sections. Only consider content changes. 
Do not reformat sections. 
Do not change tools used in an achievement, the rewording must not lie. 
Do not excessively summarize sentences.
Do not mention line numbers in recommendation text. 
Focus on rewording achievements to job terms used in the job description without changing original meaning.
For each line given, alter the text to better match the job description. 
Match punctuation of the original line. Lines that do not end in a period should not be altered to have a period.
Only include changes that are significant improvement to the line. Do not include slight rewordings. 
'Rationale' should indicate how the change helps match the resume to the job description.
The rationale must quote exact words mentioned in the job description. Do not hallucinate.

'Text' is the new text that will be inserted into the resume.
If no changes are necessary for a line, leave the text blank.

START JOB DESCRIPTION: 

{jobDescription}

END JOB DESCRIPTION

START RESUME:
            
{resume}

END RESUME";

        if (!string.IsNullOrEmpty(userNotes))
        {
            prompt +=
                @$" 
ADDITIONAL USER NOTES:

{userNotes}

END ADDITIONAL USER NOTES
";
        }

        await foreach (
            var msg in _kernel.InvokePromptStreamingAsync(prompt, new(executionSettings))
        )
        {
            var content = (msg as StreamingChatMessageContent).Content;
            if (content != null)
            {
                yield return content;
            }
        }
    }
}

#pragma warning restore SKEXP0010
