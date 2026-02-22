import { PersonaType } from '@/types/conversation';
import { MOCK_ANIME } from './anime';

// Mock AI response generator
export async function generateMockAIResponse(
  userMessage: string,
  personaType: PersonaType
): Promise<string> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500));

  const lowerMessage = userMessage.toLowerCase();

  // Check for anime recommendation keywords
  if (
    lowerMessage.includes('recommend') ||
    lowerMessage.includes('suggest') ||
    lowerMessage.includes('anime') ||
    lowerMessage.includes('watch')
  ) {
    return getRecommendationResponse(personaType, lowerMessage);
  }

  // Check for greetings
  if (
    lowerMessage.includes('hello') ||
    lowerMessage.includes('hi') ||
    lowerMessage.includes('hey')
  ) {
    return getGreetingResponse(personaType);
  }

  // Check for genre-specific requests
  if (lowerMessage.includes('action')) {
    return getGenreResponse(personaType, 'action');
  }

  if (lowerMessage.includes('comedy')) {
    return getGenreResponse(personaType, 'comedy');
  }

  // Default response
  return getDefaultResponse(personaType);
}

function getGreetingResponse(personaType: PersonaType): string {
  const responses = {
    sommelier:
      "Good day! I'm delighted to assist you in finding the perfect anime. Tell me, what sort of experience are you seeking today? Perhaps something profound and thought-provoking, or maybe a thrilling adventure?",
    cafe_owner:
      "Hey there! Welcome! 😊 Pull up a chair and let's chat about anime. What brings you in today? Looking for something specific or just browsing?",
    otaku_friend:
      "Yooo what's up! Ready to talk anime? I'm SO excited to help you find something amazing to watch! What kind of vibe are you feeling today?",
  };

  return responses[personaType];
}

function getRecommendationResponse(
  personaType: PersonaType,
  message: string
): string {
  // Pick a random anime from mock data
  const randomAnime = MOCK_ANIME[Math.floor(Math.random() * MOCK_ANIME.length)];

  const responses = {
    sommelier: `Ah, an excellent inquiry! Based on your interests, I'd recommend **${randomAnime.title}**.

${randomAnime.aiReasoning}

It's ${randomAnime.episodes} episodes of pure excellence, rated ${randomAnime.score}/10. The series explores ${randomAnime.genres.join(', ').toLowerCase()}, delivering a truly memorable experience.

Would you like to know more about this title, or shall I suggest alternatives?`,

    cafe_owner: `Ooh, I've got the perfect one for you! Check out **${randomAnime.title}**!

${randomAnime.episodes} episodes that you can totally binge. It's got ${randomAnime.genres.join(', ')} vibes, and honestly? It's rated ${randomAnime.score}/10 for a reason - it's THAT good!

${randomAnime.synopsis}

Want me to suggest something similar, or is this hitting the spot?`,

    otaku_friend: `BRO! You NEED to watch **${randomAnime.title}** right NOW! 🔥

${randomAnime.aiReasoning}

It's ${randomAnime.episodes} episodes of PURE FIRE! Rated ${randomAnime.score}/10 - and trust me, it deserves every point. It's got ${randomAnime.genres.join(', ')} and it absolutely DELIVERS!

You watching this or what?! 😎`,
  };

  return responses[personaType];
}

function getGenreResponse(personaType: PersonaType, genre: string): string {
  const genreAnime = MOCK_ANIME.filter((anime) =>
    anime.genres.some((g) => g.toLowerCase().includes(genre.toLowerCase()))
  );

  const anime = genreAnime[0] || MOCK_ANIME[0];

  const responses = {
    sommelier: `For ${genre} enthusiasts, I must recommend **${anime.title}**. It masterfully balances intense sequences with character development. Rated ${anime.score}/10, it's a refined choice for discerning viewers.`,

    cafe_owner: `Oh you want ${genre}? Perfect! **${anime.title}** is exactly what you need! It's got amazing ${genre} scenes and it's just SO good. ${anime.episodes} episodes of pure entertainment!`,

    otaku_friend: `${genre.toUpperCase()}?! Say less fam! **${anime.title}** is THE ${genre} anime you're looking for! ${anime.score}/10 rating speaks for itself. It's INSANE! 🔥`,
  };

  return responses[personaType];
}

function getDefaultResponse(personaType: PersonaType): string {
  const responses = {
    sommelier:
      "I appreciate your message. To provide you with the most suitable recommendations, could you share more about your preferences? What genres do you typically enjoy? Are you in the mood for something light-hearted or more serious?",

    cafe_owner:
      "Hmm, let me think about that! 🤔 To help you better, could you tell me a bit more? Like, what kind of stuff do you usually enjoy? Action? Drama? Something funny?",

    otaku_friend:
      "Interesting! So like, what exactly are you looking for? Give me some deets! What kind of anime gets you hyped? I wanna make sure I recommend something you'll LOVE!",
  };

  return responses[personaType];
}
