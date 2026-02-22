import { Conversation, ConversationListItem, Message } from '@/types/conversation';

export const MOCK_CONVERSATIONS: ConversationListItem[] = [
  {
    id: 'conv-1',
    title: 'Looking for action anime',
    personaType: 'sommelier',
    lastMessage: "I'd recommend Fullmetal Alchemist: Brotherhood for you.",
    lastMessageAt: new Date('2024-02-15T10:30:00'),
    messageCount: 8,
  },
  {
    id: 'conv-2',
    title: 'Something to binge this weekend',
    personaType: 'cafe_owner',
    lastMessage: 'Chainsaw Man is perfect for a weekend binge!',
    lastMessageAt: new Date('2024-02-14T15:20:00'),
    messageCount: 5,
  },
  {
    id: 'conv-3',
    title: 'Time travel recommendations',
    personaType: 'otaku_friend',
    lastMessage: 'Steins;Gate is THE time travel anime, bruh!',
    lastMessageAt: new Date('2024-02-13T09:15:00'),
    messageCount: 12,
  },
];

export const MOCK_MESSAGES: Record<string, Message[]> = {
  'conv-1': [
    {
      id: 'msg-1',
      conversationId: 'conv-1',
      role: 'user',
      content: "I'm looking for a good action anime with deep characters",
      timestamp: new Date('2024-02-15T10:00:00'),
    },
    {
      id: 'msg-2',
      conversationId: 'conv-1',
      role: 'assistant',
      content:
        "Ah, excellent choice! For action with substantial character development, I'd highly recommend **Fullmetal Alchemist: Brotherhood**. \n\nThe Elric brothers' journey is not just about spectacular alchemy battles—it's a profound exploration of sacrifice, redemption, and the consequences of playing god. Each character, from the protagonists to the antagonists, has compelling motivations and undergoes meaningful growth.\n\nWould you like to know more about the themes, or shall I suggest similar titles?",
      timestamp: new Date('2024-02-15T10:01:00'),
    },
    {
      id: 'msg-3',
      conversationId: 'conv-1',
      role: 'user',
      content: 'That sounds perfect! How many episodes is it?',
      timestamp: new Date('2024-02-15T10:30:00'),
    },
    {
      id: 'msg-4',
      conversationId: 'conv-1',
      role: 'assistant',
      content:
        "It's 64 episodes in total. I know that might seem like a commitment, but the pacing is excellent—no filler, and the story maintains momentum throughout. \n\nThe series aired from 2009-2010 and is a complete adaptation of the manga, so you'll get the full, satisfying conclusion. Many consider it one of the best anime of all time, currently rated 9.1 on MyAnimeList.\n\nWould you prefer something shorter, or are you ready to dive into this epic?",
      timestamp: new Date('2024-02-15T10:30:30'),
    },
  ],
  'conv-2': [
    {
      id: 'msg-5',
      conversationId: 'conv-2',
      role: 'user',
      content: 'I have a free weekend coming up, need something to binge!',
      timestamp: new Date('2024-02-14T15:00:00'),
    },
    {
      id: 'msg-6',
      conversationId: 'conv-2',
      role: 'assistant',
      content:
        "Oh nice! Weekend binge mode activated! 🎬\n\nSo, what kind of vibe are you going for? Something that'll:\n\n1. Make you laugh till you cry?\n2. Keep you on the edge of your seat?\n3. Hit you right in the feels?\n4. All of the above?\n\nAlso, how many episodes are we talking? Quick 12-episode series or something meatier?",
      timestamp: new Date('2024-02-14T15:01:00'),
    },
    {
      id: 'msg-7',
      conversationId: 'conv-2',
      role: 'user',
      content: 'Edge of my seat sounds great! 12 episodes would be perfect',
      timestamp: new Date('2024-02-14T15:20:00'),
    },
    {
      id: 'msg-8',
      conversationId: 'conv-2',
      role: 'assistant',
      content:
        "Perfect timing! **Chainsaw Man** is EXACTLY what you need!\n\n12 episodes of pure adrenaline - it's like someone took action, horror, and dark comedy, threw them in a blender, and cranked it to max. The animation by MAPPA is absolutely stunning, every episode feels like a movie.\n\nFair warning though: it's wild, it's weird, and it doesn't hold back. But if you're up for something that'll keep you glued to your screen all weekend, this is it!\n\nSound good?",
      timestamp: new Date('2024-02-14T15:20:30'),
    },
  ],
};
