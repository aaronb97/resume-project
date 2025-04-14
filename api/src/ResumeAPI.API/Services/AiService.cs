using Microsoft.SemanticKernel.Connectors.OpenAI;
using ResumeAPI.Models;

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
            .AddOpenAIChatCompletion(modelId: "gpt-4o", apiKey: configuration["OpenAI:ApiKey"]!)
            .Build();
    }

    public async Task<ResumeAiResponse> GetRecommendations(string jobDescription, string resume)
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
Focus on rewording achievements to job terms used in the job description without changing original meaning.
For each line given, alter the text to better match the job description. 
Match punctuation of the original line. 
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

        var result = await _kernel.InvokePromptAsync(prompt, new(executionSettings));

        return JsonSerializer.Deserialize<ResumeAiResponse>(result.ToString())
            ?? throw new JsonException("Failed to deserialize response.");
    }
}

#pragma warning restore SKEXP0010
