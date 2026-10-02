// Manage who can use the CMS. Runs locally with the secret key from .env.local.
//
//   pnpm admin add <email> [--password <password>]       create the login (or reuse it) and give CMS access
//   pnpm admin list                                       show all CMS admins
//   pnpm admin password <email> [--password <password>]  set a new password
//   pnpm admin remove <email>                             take away CMS access (the login itself stays)
//   pnpm admin delete <email>                             delete the login completely
//
// Without --password a strong random password is generated and printed once.

import { randomBytes } from "node:crypto"
import { createClient, type User } from "@supabase/supabase-js"

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const secretKey = process.env.SUPABASE_SECRET_KEY
if (!url || !secretKey) {
  console.error("Set NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SECRET_KEY in .env.local first.")
  process.exit(1)
}
const supabase = createClient(url, secretKey, { auth: { persistSession: false, autoRefreshToken: false } })

const [command, emailArg] = process.argv.slice(2)
const passwordFlag = process.argv.indexOf("--password")
const passwordArg = passwordFlag > -1 ? process.argv[passwordFlag + 1] : undefined
const email = emailArg?.trim().toLowerCase()

function generatePassword() {
  return randomBytes(18).toString("base64url") // 24 characters
}

function requireEmail(): string {
  if (!email?.includes("@")) {
    console.error(`Usage: pnpm admin ${command} <email>`)
    process.exit(1)
  }
  return email
}

async function findUser(address: string): Promise<User | undefined> {
  for (let page = 1; ; page++) {
    const { data, error } = await supabase.auth.admin.listUsers({ page, perPage: 1000 })
    if (error) throw error
    const user = data.users.find((u) => u.email?.toLowerCase() === address)
    if (user || data.users.length < 1000) return user
  }
}

async function add() {
  const address = requireEmail()
  const password = passwordArg ?? generatePassword()
  let user = await findUser(address)
  if (user) {
    console.log(`Login already exists for ${address}.`)
    if (passwordArg) {
      const { error } = await supabase.auth.admin.updateUserById(user.id, { password })
      if (error) throw error
      console.log("Password updated.")
    }
  } else {
    const { data, error } = await supabase.auth.admin.createUser({ email: address, password, email_confirm: true })
    if (error) throw error
    user = data.user
    console.log(`Created login for ${address}.`)
    if (!passwordArg) console.log(`Password (shown once, store it in a password manager): ${password}`)
  }
  const { error } = await supabase.from("eu_admins").upsert({ user_id: user.id }, { onConflict: "user_id" })
  if (error) throw error
  console.log(`${address} can now sign in to the CMS.`)
}

async function list() {
  const { data, error } = await supabase.from("eu_admins").select("user_id, created_at").order("created_at")
  if (error) throw error
  if (!data.length) return console.log("No admins yet. Add one with: pnpm admin add <email>")
  for (const row of data) {
    const { data: found } = await supabase.auth.admin.getUserById(row.user_id)
    const lastSignIn = found.user?.last_sign_in_at ? new Date(found.user.last_sign_in_at).toLocaleString() : "never"
    console.log(
      `${found.user?.email ?? row.user_id}  (admin since ${new Date(row.created_at).toLocaleDateString()}, last sign-in ${lastSignIn})`,
    )
  }
}

async function password() {
  const address = requireEmail()
  const user = await findUser(address)
  if (!user) throw new Error(`No login found for ${address}.`)
  const next = passwordArg ?? generatePassword()
  const { error } = await supabase.auth.admin.updateUserById(user.id, { password: next })
  if (error) throw error
  console.log(passwordArg ? "Password updated." : `New password (shown once): ${next}`)
}

async function remove() {
  const address = requireEmail()
  const user = await findUser(address)
  if (!user) throw new Error(`No login found for ${address}.`)
  const { error } = await supabase.from("eu_admins").delete().eq("user_id", user.id)
  if (error) throw error
  console.log(`${address} can no longer use the CMS (the login still exists; use "delete" to remove it).`)
}

async function deleteLogin() {
  const address = requireEmail()
  const user = await findUser(address)
  if (!user) throw new Error(`No login found for ${address}.`)
  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) throw error
  console.log(`Deleted the login for ${address}.`)
}

const commands: Record<string, () => Promise<unknown>> = { add, list, password, remove, delete: deleteLogin }
const run = command ? commands[command] : undefined
if (!run) {
  console.log("Usage: pnpm admin <add|list|password|remove|delete> [email] [--password <password>]")
  process.exit(command ? 1 : 0)
}
run().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : error)
  process.exit(1)
})
