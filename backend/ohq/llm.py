from django.conf import settings
import openai


def generateResponse(question, llmSettings):
    openai.api_key = settings.OPENAI_API_KEY
    messages = [
        {"role": "system", "content": llmSettings.llm_prompt},
        {"role": "user", "content": question}
    ]

    response = openai.ChatCompletion.create(
        messages = messages,
        temperature = float(llmSettings.temperature),
        model= str(llmSettings.model_name)
    )
    content = response["choices"][0]["message"]["content"]
    prompt_tokens = response["usage"]["prompt_tokens"]
    completion_tokens = response["usage"]["completion_tokens"]
    total_tokens = prompt_tokens + completion_tokens
    print(content)
    return content