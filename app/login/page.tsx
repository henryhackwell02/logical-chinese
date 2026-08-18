import { loginAction } from "@/app/actions";

export default function LoginPage({
  searchParams,
}: {
  searchParams: { error?: string };
}) {
  return (
    <div className="max-w-sm mx-auto px-4 py-20">
      <h1 className="text-2xl font-bold tracking-tight">Admin login</h1>
      <p className="mt-2 text-sm text-stone-500">
        Log in to add, edit, or delete characters.
      </p>
      <form action={loginAction} className="mt-6 space-y-4">
        <input
          type="password"
          name="password"
          required
          autoFocus
          placeholder="Admin password"
          className="w-full rounded-lg border border-stone-300 px-3 py-2"
        />
        {searchParams.error && (
          <p className="text-sm text-red-600">Incorrect password.</p>
        )}
        <button
          type="submit"
          className="w-full rounded-lg bg-red-700 text-white px-4 py-2.5 font-medium hover:bg-red-800"
        >
          Log in
        </button>
      </form>
    </div>
  );
}
