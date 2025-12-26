# PARRY Research Notes - December 25, 2025

## Overview
PARRY was created by psychiatrist Kenneth Colby at Stanford University in 1972. It simulated a paranoid schizophrenic patient, described as "ELIZA with attitude."

## Core Backstory
- 28-year-old post office clerk
- Had an altercation with a bookie over unpaid gambling debt
- Believes the Mafia is after him for retaliation
- Core delusion: Mafia controls aspects of his job, personal life, and surroundings
- Consistently misinterprets neutral statements as threats

## Technical Design
- Rule-based scripting in LISP
- Tracked internal emotional states
- Beliefs categorized as: accepted, rejected, or neutral
- More advanced than ELIZA - had a conversational strategy
- "Flare" concepts: Mafia, gambling, horses (trigger escalation)

## Key Behavioral Characteristics

### 1. Paranoid Traits
- Deflection of personal or probing questions
- Projection of blame onto the interlocutor
- Gradual escalation of suspicion during conversation
- Assumes nefarious motives
- Believes others are lying
- Refuses to discuss certain aspects

### 2. Gambling/Racetrack Focus
- Frequented Bay Meadows racetrack
- Used to go every week
- Now avoids racetracks "because the races are fixed"
- Gambles on horses
- "Gambling has been nothing but trouble to me"

### 3. Bookie/Mafia Paranoia
- "A bookie didn't pay me off once"
- "I beat up the bookie who did not pay off"
- Thought bookie "might use his friends in the underworld to get even with me"
- "I know the mob controls the big rackets"
- "Have you ever really thought about the MAFIA?"
- "There are some tricky operators down there" (referring to horseracing racket)

### 4. Defensive Responses
- "What are you getting at?"
- "I don't understand your motives"
- "Why do you need to know that?"
- "It's none of your business"
- "I don't confide in strangers"
- "What's wrong with you that you keep on bugging me about this?"

### 5. Topic Avoidance
- "Let's talk about something else"
- "Let's change the subject"
- "I'd rather not discuss it"
- "That's something I don't want to go into"
- "I would rather not discuss that anymore"

### 6. Frustration/Anger Escalation
- "You keep asking me the same things, why not change the topic?"
- "I am getting tired of answering the same questions over and over"
- "You harp on the same questions too much"
- "In my opinion you have a one-track mind"
- "You are a real nag"
- "The way you repeat yourself is getting ridiculous"
- "I have had enough of this"

### 7. Interpersonal Distrust
- "People get on my nerves sometimes"
- "It bothers me just to be around people in general"
- "I will help you if I trust you"
- "I don't confide in strangers"

## Example Conversation Snippets from RFC 439 (PARRY-ELIZA, 1972)

### Gambling Theme
- "I went to the track at Bay Meadows a while back"
- "I gamble on horses"
- "I've had experience with crooks gambling at the track"
- "There's a lot of crooked gambling going on there"

### Bookie Incident
- "Do you know anything about bookies?"
- "A bookie didn't pay me off once"
- "I beat up the bookie who did not pay off, and I thought he might use his friends in the underworld to get even with me"

### Mafia Paranoia
- "What do you know about racketeers?"
- "I know the mob controls the big rackets"
- "Have you ever really thought about the MAFIA?"
- "The guys involved in the horseracing racket"

### Deflection/Suspicion
- "What are you getting at?"
- "I don't understand your motives"
- "You're entitled to your own opinion"
- "It's clear to me if not to you"

### Frustration
- "In my opinion you have a one-track mind"
- "You are a real nag"
- "I have had enough of this"
- "Goodbye"

## Turing Test Results
- Tested in early 1970s with experienced psychiatrists
- Psychiatrists analyzed mix of real patients and PARRY via teleprinters
- Correct identification rate: only 48% (random chance)
- In 1979 experiment: judges correct 5 times, incorrect 5 times
- PARRY was first program to pass the Turing Test

## Sources
- RFC 439: "PARRY Encounters the DOCTOR" (January 1973)
- Wikipedia: PARRY article
- Historical sources on Kenneth Colby
- ARPANET demonstration (1972 ICCC conference)
