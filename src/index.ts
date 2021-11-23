function hello(name?: string) {
  console.log(`Hello ${name}`)
}
hello(process.env.NAME);
