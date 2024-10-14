export function generatePassword(length: number = 12): string {
  const lowerCase: string = getRandomCharacters('abcdefghijkmnopqrstuvwxyz', 1);
  const upperCase: string = getRandomCharacters('ABCDEFGHJKLMNPQRSTUVWXYZ', 1);
  const numbers: string = getRandomCharacters('23456789', 3);
  const specialCharacters: string = getRandomCharacters('()_$%!#[]', 1);
  const remainingLength: number = length - (lowerCase.length + upperCase.length + numbers.length + specialCharacters.length);

  // Genera i restanti caratteri casuali
  const allCharacters: string = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ';
  const remainingCharacters: string = getRandomCharacters(allCharacters, remainingLength);

  // Combina tutti i caratteri e mescola
  const passwordArray: string = lowerCase + upperCase + numbers + specialCharacters + remainingCharacters;
  return shuffleString(passwordArray);
}

function getRandomCharacters(characters: string, count: number): string {
  let result: string = '';
  for (let i = 0; i < count; i++) {
    const randomIndex: number = Math.floor(Math.random() * characters.length);
    result += characters.charAt(randomIndex);
  }
  return result;
}

function shuffleString(str: string): string {
  const array: string[] = str.split('');
  for (let i = array.length - 1; i > 0; i--) {
    const j: number = Math.floor(Math.random() * (i + 1));
    [array[i], array[j]] = [array[j], array[i]];
  }
  return array.join('');
}

