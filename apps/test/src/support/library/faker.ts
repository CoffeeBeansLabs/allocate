import { faker } from '@faker-js/faker';
class DataGenerator {
  // Generate a random client name
  generateClient(): string {
    return faker.company.name();
  }
  generateProject(): string {

    const prefixes = ["Project", "Initiative", "Operation", "Plan", "Program"];
    const suffixes = ["Alpha", "Beta", "Delta", "Omega", "Prime", "X"];

    const name_patterns = [
      "{prefix} {word}",
      "{word} {suffix}",
      "{prefix} {word} {suffix}",
      "{word} {year}",
      "{prefix} {color} {noun}",
      "{adjective} {noun}",
    ];

    const pattern = faker.helpers.arrayElement(name_patterns);

    return pattern.replace(/{(\w+)}/g, (match, key) => {
      switch (key) {
        case 'prefix':
          return faker.helpers.arrayElement(prefixes);
        case 'suffix':
          return faker.helpers.arrayElement(suffixes);
        case 'word':
          return faker.word.noun().charAt(0).toUpperCase() + faker.word.noun().slice(1);
        case 'year':
          return faker.date.future().getFullYear().toString();
        case 'color':
          return faker.color.human();
        case 'noun':
          return faker.word.noun();
        case 'adjective':
          return faker.word.adjective();
        default:
          return match;
      }
    });
  }
  generateName(): string {
    return faker.person.fullName();
  }
  generateEmail(): string {
    return faker.internet.email();
  }
  generatePhoneNumber(): string {
    // Indian mobile numbers start with 6, 7, 8, or 9 and have 10 digits
    const prefix = faker.helpers.arrayElement(['6', '7', '8', '9']);
    const remainingDigits = faker.random.numeric(9);
    return `+91${prefix}${remainingDigits}`;
  }
  generateDate(): string {
    // Generate a date one day more than today's date
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    return tomorrow.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  }
}
export default new DataGenerator();