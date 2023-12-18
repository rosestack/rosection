class Type1 {
  value: string | symbol;
}

interface Type2 {
  name: string;
  use: boolean;
}

type Token = string | Type1 | Type2;

const token: Token = {
  name: "token",
  use: true,
  value: "value",
};