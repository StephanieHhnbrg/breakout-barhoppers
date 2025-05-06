export interface User {
  mail: string,
  name: string,

  barId?: string,
}

export interface Friend extends User {
  status: "pending" | "requested" | "",
  picture?: string,
}
