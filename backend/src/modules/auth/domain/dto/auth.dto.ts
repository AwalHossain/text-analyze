interface GoogleProfile {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  id: string;
}

class AuthResponseDto {
  access_token: string;
  user: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
  };
}
type JwtPayload = {
  email: string;
  userId: string;
};

export { GoogleProfile, AuthResponseDto, JwtPayload };
