from dotenv import load_dotenv
load_dotenv()

from langchain_community.document_loaders import PyPDFLoader
from langchain_openai import ChatOpenAI
import json
import re

def analyze_pdf(pdf_path, user_questions):

    loader = PyPDFLoader(pdf_path)
    documents = loader.load()
    full_text = "\n\n".join([d.page_content for d in documents])

    chat = ChatOpenAI(model="gpt-4o", temperature=0)

    prompt = f"""
You are a PDF question-answer extraction assistant.

Extract ALL answers ONLY from the PDF text below:
------------------------------------------------
{full_text}
------------------------------------------------

User questions:
{user_questions}

Now generate a JSON object where EACH question becomes a key, and the corresponding extracted answer becomes the value.

STRICT FORMAT:
{{
  "question1": "answer1",
  "question2": "answer2",
  ...
}}

Rules:
- Number of questions is NOT fixed — include ALL questions dynamically.
- Keys MUST match the exact wording of each question.
- Answers must be extracted ONLY from the PDF.
- If the answer is a list (e.g., multiple skills), return a JSON array.
- If answer not found, use: "Data not found in the PDF".
- Return ONLY valid JSON. No text, no markdown, no explanation.
"""


    response = chat.invoke(prompt)
    raw_output = response.content

    json_match = re.search(r"\{[\s\S]*\}", raw_output)
    if json_match:
        return json.loads(json_match.group())
    
    return {"error": "Invalid response format", "raw": raw_output}
