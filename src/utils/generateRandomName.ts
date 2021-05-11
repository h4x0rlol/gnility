import {
  uniqueNamesGenerator,
  Config,
  adjectives,
  colors,
  animals,
} from "unique-names-generator";

const customConfig: Config = {
  dictionaries: [adjectives, colors, animals],
  separator: "_",
  length: 3,
  style: "capital",
};

export async function getRandomName() {
  return uniqueNamesGenerator(customConfig);
}
