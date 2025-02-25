export class UserEntity {
  constructor(
    private readonly _id: string,
    private readonly _email: string,
    private readonly _firstName: string,
    private readonly _lastName: string,
    private readonly _picture: string,
    private readonly _provider: string,
    private readonly _providerId: string,
  ) {}

  get id(): string {
    return this._id;
  }
  get email(): string {
    return this._email;
  }
  get firstName(): string {
    return this._firstName;
  }
  get lastName(): string {
    return this._lastName;
  }
  get picture(): string {
    return this._picture;
  }
  get provider(): string {
    return this._provider;
  }
  get providerId(): string {
    return this._providerId;
  }

  toJSON() {
    return {
      id: this._id,
      email: this._email,
      firstName: this._firstName,
      lastName: this._lastName,
      picture: this._picture,
    };
  }
}
