
from google import genai
from groq import Groq

from app.config import GEMINI_API_KEY, GROQ_API_KEY


def call_gemini(prompt: str) -> str:
    client = genai.Client(api_key=GEMINI_API_KEY)

    response = client.models.generate_content(
        model="gemini-3.7-flash",
        contents=prompt
    )

    return response.text


def call_groq(prompt: str) -> str:
    client = Groq(api_key=GROQ_API_KEY)

    response = client.chat.completions.create(
        model="openai/gpt-oss-120b",
        messages=[
            {
                "role": "user",
                "content": prompt
            }
        ],
        temperature=0
    )

    return response.choices[0].message.content


def call_llm(prompt: str) -> str:
    try:
        print("Trying Gemini...")
        return call_gemini(prompt)

    except Exception as gemini_error:
        print(f"Gemini failed: {gemini_error}")
        print("Falling back to Groq...")

        try:
            print("Trying Groq...")
            return call_groq(prompt)

        except Exception as groq_error:
            print(f"Groq failed: {groq_error}")
            raise RuntimeError(
                "Both Gemini and Groq failed."
            ) from groq_error