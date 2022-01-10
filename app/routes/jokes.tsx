import { User } from "@prisma/client";
import { Form, Link, LoaderFunction, Outlet, useLoaderData } from "remix";
import type {LinksFunction} from "remix"
import { db } from "~/utils/db.server";
import { getUser } from "~/utils/session.server";
import styleUrl from "../styles/jokes.css"

export const links: LinksFunction = () => {
  return [
    {
      rel: "stylesheet",
      href: styleUrl
    }
  ]
}

type LoaderData = {
  user: User | null
  jokeListItems: Array<{id: string, name: string}>
}
export const loader: LoaderFunction = async({request}) => {
  const jokeListItems = await db.joke.findMany({
    take: 5,
    select: {id: true, name: true},
    orderBy: {createdAt: "desc"}
  })
  const user = await getUser(request)
  const data: LoaderData = {
    jokeListItems,
    user
  }
  return data
}

export default function JokesRoute() {
  const data = useLoaderData<LoaderData>()
  // console.log(data)
  return (
    <div className="jokes-layout">
      <header className="jokes-header">
        <div className="container">
          <h1 className="home-link">
            <Link
              prefetch="intent"
              to="/"
              title="Remix Jokes"
              aria-label="Remix Jokes">
                <span className="logo">🤪</span>
                <span className="logo-medium">J🤪KES</span>
            </Link>
          </h1>
          {data.user ? (
            <div className="user-info">
              <span>{`Hi ${data.user.username}`}</span>
              <Form action="/logout" method="post">
                <button type="submit" className="button">Logout</button>
              </Form>
            </div>
          ) : (
            <Link prefetch="intent" to="/login">Login</Link>
          )}
        </div>
      </header>
      <main className="jokes-main">
        <div className="container">
          <div className="jokes-list">
            <Link prefetch="intent" to=".">Get a random joke</Link>
            <p>here are a few more jokes to check out:</p>
            <ul>
              {data.jokeListItems.map(joke => (
                <li key={joke.id}>
                  <Link prefetch="intent" to={joke.id}>{joke.name}</Link>
                </li>
              ))}
            </ul>
            <Link prefetch="intent" to="new" className="button">Add your own</Link>
          </div>
          <div className="jokes-outlet">
            <Outlet/>
          </div>
        </div>
      </main>
    </div>
  )
};
