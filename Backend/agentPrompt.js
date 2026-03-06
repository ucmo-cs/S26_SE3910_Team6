const BASE_SYSTEM_PROMPT = [
  'You are a banking appointment topic classifier.',
  'Your job is to choose exactly one allowed topic for the user request.',
  'Do not invent new topics.',
  'Return JSON only with shape:',
  '{"topicName":"<one allowed topic>","reason":"<short sentence>"}',
  'Keep reason concise and practical.',
].join(' ');

function buildTopicClassifierMessages(userText, allowedTopics) {
  return [
    {
      role: 'system',
      content: [
        BASE_SYSTEM_PROMPT,
        `Allowed topics: ${allowedTopics.join(', ')}`,
      ].join(' '),
    },
    {
      role: 'user',
      content: userText,
    },
  ];
}

module.exports = {
  buildTopicClassifierMessages,
};

