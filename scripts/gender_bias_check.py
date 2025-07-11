# scripts/gender_bias_check.py
import pandas as pd
import re
import string

def load_gender_word_lists_and_types():
    df = pd.read_csv("data/corrected_gender_dataset.csv")
    male_words = df[df["label"] == "male"]["word"].tolist()
    female_words = df[df["label"] == "female"]["word"].tolist()
    bias_types = df["bias_type"].unique().tolist()
    bias_words_by_type = {bt: df[df["bias_type"] == bt]["word"].tolist() for bt in bias_types}
    return male_words, female_words, bias_words_by_type

def normalize_text(text):
    # Lowercase, remove punctuation, replace all whitespace (including newlines) with single spaces
    text = text.lower()
    text = text.translate(str.maketrans('', '', string.punctuation))
    text = re.sub(r'\s+', ' ', text)
    return text.strip()

def find_matches(text, word_list):
    matches = set()
    norm_text = normalize_text(text)
    for word in word_list:
        norm_word = normalize_text(word)
        if norm_word in norm_text:
            matches.add(word)
    return list(matches)

def detect_gender_bias(text, male_words, female_words, bias_words_by_type):
    found_male = find_matches(text, male_words)
    found_female = find_matches(text, female_words)
    found_by_type = {bt: find_matches(text, words) for bt, words in bias_words_by_type.items()}
    bias_detected = (
        len(found_male) > 0 or len(found_female) > 0 or any(len(words) > 0 for words in found_by_type.values())
    )
    return {
        "male_words": found_male,
        "female_words": found_female,
        "found_by_type": found_by_type,
        "bias_detected": bias_detected
    }

def pretty_print_bias_report(result):
    print("\n=== Bias Detection Report ===")
    print(f"Bias detected: {'YES' if result['bias_detected'] else 'NO'}\n")
    if result["male_words"]:
        print(f"Male-coded words/phrases: {', '.join(result['male_words'])}")
    if result["female_words"]:
        print(f"Female-coded words/phrases: {', '.join(result['female_words'])}")
    for bias_type, words in result["found_by_type"].items():
        if words:
            print(f"{bias_type.replace('_', ' ').title()} bias words/phrases: {', '.join(words)}")
    if not (result["male_words"] or result["female_words"] or any(result["found_by_type"].values())):
        print("No bias-coded words or phrases found.")

# Example usage
if __name__ == "__main__":
    sample = '''Senior Software Engineer - Tech Ninja Wanted!
Are you a coding rockstar ready to dominate the tech world?
About Our Company
We're a fast-paced, high-energy startup looking for young, hungry developers who can work hard and play hard! Our dynamic team of digital natives thrives in our modern, open office where we battle complex problems and crush our competition.
What We're Looking For
We need a code warrior who can:

Dominate full-stack development challenges with aggressive problem-solving
Conquer complex algorithms using superior analytical and logical thinking
Fight through debugging sessions with relentless determination and persistence
Tackle aggressive deadlines with confidence, drive, and competitive spirit
Be a self-reliant champion who is independent, decisive, and doesn't need hand-holding
Crush technical interviews and prove your elite coding pedigree with superior intellect
Show strong leadership qualities and assertive communication style
Demonstrate objective decision-making and principled approach to development
Battle-test code with fearless debugging and forceful optimization
Outperform competitors through dominant technical skills

Requirements

Fresh graduate or recent graduate from a top-tier university (Ivy League preferred)
Young, energetic professional with unlimited availability and competitive drive
Must be articulate and well-spoken with professional appearance
Physically able to work long hours and handle the pressure with stamina
Single or no family commitments - this role requires extensive travel and weekend availability
Must have superior intelligence, analytical mindset, and natural leadership instincts
Looking for a culture fit who shares our work hard, play hard mentality
Strong, decisive personality with killer instincts and fearless attitude
Must be a team player but also an independent self-starter with autonomous work style
Native English speaker with clean background and assertive communication
Ambitious individual who can dominate technical discussions with logic and principles
Persistent problem-solver who won't yield under pressure
Confident decision-maker with forceful project management skills

What We Offer

Competitive salary (for the right cultural fit)
Unlimited PTO (though our ninjas rarely take time off!)
Ping pong table and beer on tap
Open office environment with high-energy atmosphere
Opportunity to work with the best and brightest
Fast-track to leadership for proven warriors

Ideal Candidate
Our perfect hire is a confident, aggressive go-getter who can think on his feet and take charge when needed. He should be ambitious and competitive, ready to dominate in our male-dominated tech environment with superior analytical skills and logical problem-solving.
We're looking for someone young and hungry who can hit the ground running and doesn't need special accommodations. This role is perfect for a recent graduate who wants to make his mark in the industry through persistent effort and decisive action.
The ideal candidate will be independent, self-reliant, and autonomous in his approach, while also being assertive in team settings. He should have strong principles, objective judgment, and the determination to battle through complex technical challenges.
Guys, if you think you have what it takes to join our elite team of coding ninjas, apply now!'''
    male_words, female_words, bias_words_by_type = load_gender_word_lists_and_types()
    result = detect_gender_bias(sample, male_words, female_words, bias_words_by_type)
    pretty_print_bias_report(result)
