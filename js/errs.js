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

class EmptyInputError extends Error {
  constructor(inputElement) {
    let msg = 'Please enter information in the search input field.';
    super(msg);
    this.name = 'EmptyInputError';
    this.message = msg;
    this.element = inputElement;
  }
}

class EmptyRecordsError extends Error {
  constructor() {
    let msg = 'The selected item has no records';
    super(msg);
    this.name = 'EmptyRecordsError';
    this.message = msg;
  }
}

class InvalidUserError extends Error {
  constructor(msg) {
    msg = msg ?? 'There is no match for the provided user id';
    super(msg);
    this.name = 'InvalidUserError';
    this.message = msg;
  }
}

export { NetworkError, CharactersNotAllowed, EmptyInputError, EmptyRecordsError };
