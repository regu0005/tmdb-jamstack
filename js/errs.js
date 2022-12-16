class NetworkError extends Error {
  constructor(msg, response) {
    super(msg);
    this.name = 'NetworkError';
    this.response = response;
    this.status = response.status;
    this.text = response.statusText;
  }
}

class CharactersNotAllowed extends Error {
  constructor(inputElement) {
    let msg = 'Please enter a valid text in the search input field. Only letters, numbers and space characters are allowed';
    super(msg);
    this.name = 'CharactersNotAllowed';
    this.message = msg;
    this.element = inputElement;
  }
}

export { NetworkError, CharactersNotAllowed };