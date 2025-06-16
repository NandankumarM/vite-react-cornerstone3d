export default function reverseFormatPN(name) {
    if (!name) {
      return;
    }
  
    // Split the name by ', ' to separate family name and given name
    const [familyName, givenName] = name.split(', ');
  
    // Return the name in the format family_name^given_name
    return `${familyName ?? ''}^${givenName ?? ''}`;
  }
  
  // Example usage
  // const formattedName = reverseFormatPN("rajkumar, Rah");
  // console.log(formattedName); // Output: "rajkumar^Rah"