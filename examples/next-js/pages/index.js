import {
  Button,
  chakra,
  Container,
  DarkMode,
  Input,
  Stack,
  useColorMode,
  useColorModeValue,
} from "@chakra-ui/react"
import Head from "next/head"

function Switcher() {
  const { toggleColorMode: toggleMode } = useColorMode()
  const text = useColorModeValue("light-man", "dark-man")
  return <button onClick={toggleMode}>Current mode: {text}</button>
}

const Home = () => (
  <Container>
    <Head>
      <title>Create Next App</title>
      <link rel="icon" href="/favicon.ico" />
    </Head>

    <main>
      <chakra.div fontSize="20px">Welcome to Chakra UI</chakra.div>
      <chakra.div bg="gray.800" padding={4}>
        <DarkMode>
          <Button colorScheme="green">Welcome</Button>
        </DarkMode>
      </chakra.div>
      <Input type="tel" placeholder="Phone number" />
      <Switcher />
      <Stack direction="row" spacing="40px">
        <div>Welcome home</div>
        <div>Welcome home</div>
        <div>Welcome home</div>
      </Stack>
    </main>
  </Container>
)

export default Home
