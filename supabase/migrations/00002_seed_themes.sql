-- =============================================
-- Theme 1: Haunted House
-- =============================================
INSERT INTO riddle_themes (id, name, description, image_url, is_ai)
VALUES (
  'a1000000-0000-0000-0000-000000000001',
  'The Haunted House',
  'You''ve been locked inside a creepy old mansion. Explore its dusty rooms, uncover its dark secrets, and find your way out before the clock strikes midnight!',
  NULL,
  false
);

-- Chamber 1: Entrance Hall (visible from start)
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b1000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000001',
  'The Dusty Mirror',
  'In the entrance hall hangs a large dusty mirror. Scratched into the dust are the words: "I speak without a mouth and hear without ears. I have no body, but I come alive with wind. What am I?"',
  'Think about what the mirror itself does in reverse.',
  'echo',
  1,
  NULL,
  'The mirror shimmers as you solve it, revealing a hidden doorway behind it...',
  false
);

-- Chamber 1: Entrance Hall (visible from start)
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b1000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000001',
  'The Grandfather Clock',
  'A grandfather clock in the corner has stopped. Its face reads 3:15. A note beside it says: "When I was young, I had a face but no hands. Then I grew hands but lost my voice. Rearrange my stopped time to find the word that opens the next room."',
  'The numbers 3, 1, 5... what word uses these positions in the alphabet?',
  'ace',
  2,
  NULL,
  'The clock chimes three times and a section of the wall slides open!',
  false
);

-- Chamber 2: Library (unlocked by solving "The Dusty Mirror")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b1000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000001',
  'The Enchanted Library',
  'Behind the mirror you find a vast library. One book glows faintly on the shelf. Its title reads: "The answer you found before is also my first chapter title. In this chapter, it says: ''I have cities, but no houses. I have mountains, but no trees. I have water, but no fish. What am I?''"',
  'Think about where you can find all these things drawn together.',
  'map',
  3,
  'b1000000-0000-0000-0000-000000000001',
  'The book opens to reveal a map of the mansion with a cellar marked with an X!',
  false
);

-- Chamber 2: Study (unlocked by solving "The Grandfather Clock")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b1000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000001',
  'The Secret Study',
  'Behind the wall you find a study with a desk. On the desk is a locked box with a combination lock showing 4 letters. A note says: "I am a 4-letter word. I am a place of learning. Remove my first letter and I become something you do with a needle. Remove my next letter and I become a hot drink."',
  'Place of learning (4 letters) → needle action (3 letters) → hot drink (2 letters)',
  'sewn',
  4,
  'b1000000-0000-0000-0000-000000000002',
  'The box clicks open revealing a rusty key labeled "CELLAR"!',
  false
);

-- Chamber 3: Cellar (unlocked by solving "The Enchanted Library")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b1000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000001',
  'The Cellar Riddle',
  'You descend into the dark cellar using the map. On the wall, written in phosphorescent paint: "The map showed you the way here, and the key from the study unlocks the final door. But first: I have keys but no locks. I have space but no room. You can enter but can''t go inside. What am I?"',
  'You use it every day to write messages.',
  'keyboard',
  5,
  'b1000000-0000-0000-0000-000000000003',
  'The phosphorescent paint rearranges to show the final exit...',
  false
);

-- Chamber 4: The Exit (Final - unlocked by solving "The Cellar Riddle")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b1000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000001',
  'The Final Door',
  'Before you stands the final door to freedom. Carved into it: "I am the beginning of the end, and the end of time and space. I am essential to creation, and I surround every place. What letter am I? Speak this letter 5 times as your final answer to escape."',
  'Read the riddle very carefully — it''s about a letter of the alphabet hidden in certain words.',
  'eeeee',
  6,
  'b1000000-0000-0000-0000-000000000005',
  'The door swings open and moonlight floods in. You''ve escaped the haunted house!',
  true
);

-- =============================================
-- Theme 2: Space Station
-- =============================================
INSERT INTO riddle_themes (id, name, description, image_url, is_ai)
VALUES (
  'a1000000-0000-0000-0000-000000000002',
  'Space Station Omega',
  'Alarms blare aboard Space Station Omega. The AI has gone rogue and locked down all systems. Work together to restore power, decode transmissions, and regain control before oxygen runs out!',
  NULL,
  false
);

-- Module 1: Bridge (visible from start)
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b2000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000002',
  'Emergency Override',
  'The bridge console flickers. A message reads: "SYSTEM LOCKED. Enter emergency code. Hint: I am always in front of you but can never be seen. What am I?"',
  'Something that is always ahead but never arrives.',
  'future',
  1,
  NULL,
  'The bridge console partially activates, showing a star map...',
  false
);

-- Module 1: Engine Room (visible from start)
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b2000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000002',
  'Power Core Sequence',
  'The engine room displays: "FUEL CELLS OFFLINE. Initialize sequence: What has 13 hearts but no other organs?"',
  'Not a living creature — think about objects with "hearts."',
  'deck of cards',
  2,
  NULL,
  'The fuel cells hum to life, powering the communication array!',
  false
);

-- Module 2: Communications (unlocked by "Power Core Sequence")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b2000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000002',
  'Decode the Transmission',
  'With power restored, a garbled transmission comes through: "Mayday! The code is hidden in plain sight. What 8-letter word has only one letter in it?"',
  'Think literally — a word that contains a single letter physically inside it.',
  'envelope',
  3,
  'b2000000-0000-0000-0000-000000000002',
  'The decoded transmission reveals coordinates to the escape pod bay!',
  false
);

-- Module 2: Navigation (unlocked by "Emergency Override")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b2000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000002',
  'Star Chart Navigation',
  'The star map on the bridge reveals a puzzle: "To plot your course, solve this: The more you take, the more you leave behind. What are they?"',
  'Think about moving from one place to another.',
  'footsteps',
  4,
  'b2000000-0000-0000-0000-000000000001',
  'The navigation system plots a course to the nearest planet!',
  false
);

-- Module 3: Life Support (unlocked by "Decode the Transmission")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b2000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000002',
  'Oxygen Restoration',
  'The life support panel reads: "O2 SYSTEM REQUIRES AUTHORIZATION. Security question: I can fill a room but take up no space. What am I?"',
  'It''s something you perceive but can''t touch or hold.',
  'light',
  5,
  'b2000000-0000-0000-0000-000000000003',
  'Fresh air floods the station! The escape pod bay door unlocks!',
  false
);

-- Module 4: Escape Pod (Final - unlocked by "Oxygen Restoration")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b2000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000002',
  'Launch Sequence',
  'You reach the escape pod. The final launch code requires: "Using the navigation coordinates and the decoded transmission, answer this: I fly without wings. I cry without eyes. Whenever I go, darkness flies. What am I?"',
  'It appears in the sky and chases away the dark.',
  'cloud',
  6,
  'b2000000-0000-0000-0000-000000000005',
  'The escape pod launches! You watch Space Station Omega shrink behind you as you speed toward safety!',
  true
);

-- =============================================
-- Theme 3: Mystery Mansion
-- =============================================
INSERT INTO riddle_themes (id, name, description, image_url, is_ai)
VALUES (
  'a1000000-0000-0000-0000-000000000003',
  'Mystery Mansion: The Missing Diamond',
  'The famous Blue Star Diamond has vanished from Lord Ashworth''s mansion during a dinner party. You''re the detectives called to solve the case. Search the rooms, interrogate the evidence, and crack the case!',
  NULL,
  false
);

-- Room 1: Dining Room (visible from start)
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b3000000-0000-0000-0000-000000000001',
  'a1000000-0000-0000-0000-000000000003',
  'The Dinner Guest List',
  'In the dining room, you find the guest list with a note scrawled at the bottom: "One of us took it. Find who arrived last. Clue: I have a head and a tail but no body. What am I?"',
  'Something small and metallic that you might flip.',
  'coin',
  1,
  NULL,
  'Under the coin on the table, you find a note: "Check the butler''s pantry."',
  false
);

-- Room 1: Drawing Room (visible from start)
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b3000000-0000-0000-0000-000000000002',
  'a1000000-0000-0000-0000-000000000003',
  'The Drawing Room Portrait',
  'A portrait on the wall seems to be watching you. Beneath it: "Lord Ashworth loves word games. He wrote: I am a word of 6 letters. My first 3 letters refer to an automobile. My last 3 letters refer to a household animal. My first 4 letters is a fish. My whole is found in your room. What am I?"',
  'A type of floor covering: auto (3) + pet (3) = fish (4) + ??',
  'carpet',
  2,
  NULL,
  'You lift the carpet and find a trapdoor!',
  false
);

-- Room 2: Butler''s Pantry (unlocked by "The Dinner Guest List")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b3000000-0000-0000-0000-000000000003',
  'a1000000-0000-0000-0000-000000000003',
  'The Butler''s Secret',
  'In the butler''s pantry, you find a coded message: "The butler is innocent. But he saw something. To decode his testimony: What disappears as soon as you say its name?"',
  'The very act of saying it breaks it.',
  'silence',
  3,
  'b3000000-0000-0000-0000-000000000001',
  'The decoded message reads: "I saw someone enter the gallery at 11:45 PM."',
  false
);

-- Room 2: Secret Basement (unlocked by "The Drawing Room Portrait")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b3000000-0000-0000-0000-000000000004',
  'a1000000-0000-0000-0000-000000000003',
  'The Basement Safe',
  'Under the trapdoor you find a basement with a safe. The combination is the answer to: "What can you hold in your left hand but never in your right hand?"',
  'Think about your own body parts.',
  'right hand',
  4,
  'b3000000-0000-0000-0000-000000000002',
  'The safe opens to reveal a security camera photo from the gallery!',
  false
);

-- Room 3: Gallery (unlocked by "The Butler''s Secret")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b3000000-0000-0000-0000-000000000005',
  'a1000000-0000-0000-0000-000000000003',
  'The Gallery Investigation',
  'In the gallery where the diamond was displayed, you find a torn piece of fabric and a riddle left by the thief: "You know what time I was here from the butler. The security photo shows my shadow. Now: What has many teeth but cannot bite?"',
  'An everyday object you use on your hair or to open things.',
  'comb',
  5,
  'b3000000-0000-0000-0000-000000000003',
  'Behind a painting, you find a comb and a monogrammed handkerchief with the initials "V.H."!',
  false
);

-- Room 4: The Accusation (Final - unlocked by "The Gallery Investigation")
INSERT INTO riddles (id, theme_id, title, body, hint, answer, sort_order, depends_on_id, flavor_text, is_final)
VALUES (
  'b3000000-0000-0000-0000-000000000006',
  'a1000000-0000-0000-0000-000000000003',
  'The Final Accusation',
  'You have all the evidence: the time from the butler (11:45 PM), the security photo from the safe, and the monogrammed handkerchief "V.H." from the gallery. The guest list shows only one person with those initials who was seen near the gallery. To make your accusation, answer: "What English word has three consecutive double letters?" This is the final password to submit your case.',
  'Think about someone who keeps the accounts — a _ _ _ _ _ _ _ _ _.',
  'bookkeeper',
  6,
  'b3000000-0000-0000-0000-000000000005',
  'Case solved! Victoria Hartsworth is arrested for the theft of the Blue Star Diamond! Lord Ashworth thanks you for your brilliant detective work!',
  true
);
