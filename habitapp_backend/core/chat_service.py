import os
from openai import OpenAI
from django.conf import settings

class ChatService:
    def __init__(self):
        # Initialize OpenAI client for Groq
        api_key = os.getenv('GROQ_API_KEY')
        base_url = "https://api.groq.com/openai/v1"

        if not api_key:
            print("WARNING: GROQ_API_KEY not found in environment variables.")
            self.client = None
        else:
            self.client = OpenAI(
                base_url=base_url,
                api_key=api_key
            )

    def get_chat_response(self, messages):
        """
        Sends a list of messages to the OpenAI API and returns the response.
        messages format: [{"role": "user", "content": "hello"}, ...]
        """
        if not self.client:
            return "Error: OpenAI API Key no configurada. Por favor contacta al administrador."

        try:
            # Add system prompt if not present at the start
            system_prompt = {
                "role": "system",
                "content": (
                    "Eres el HabitMaster Coach, un asistente experto en formación de hábitos, "
                    "productividad y motivación. Tu tono es amigable, motivador y práctico. "
                    "Ayudas a los usuarios a establecer metas realistas, superar la procrastinación "
                    "y mantener sus rachas. Responde de manera concisa y útil."
                )
            }
            
            # Prepend system prompt to context
            full_messages = [system_prompt] + messages

            response = self.client.chat.completions.create(
                model="openai/gpt-oss-120b", # Or gpt-4 if available/preferred
                messages=full_messages,
                temperature=0.7,
                max_tokens=300
            )

            return response.choices[0].message.content
        except Exception as e:
            print(f"Error calling OpenAI API: {e}")
            return "Lo siento, tuve un problema al procesar tu mensaje. Inténtalo de nuevo más tarde."
