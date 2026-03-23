import { useEffect } from 'react';
import { useRouter } from 'next/router';
import ArrowBackIcon from '@material-ui/icons/ArrowBack';
import Link from 'next/link';
/**
 * A page that allows a user to create a password based acount
 */
export default function SignupPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/auth');
  }, [router]);

  return (
    <div className="h-screen flex justify-center items-center">
      <div className="relative flex flex-col items-center w-96 min-h-[16rem] bg-blue-200 p-8 justify-center">
        <Link href="/auth">
          <a className="absolute top-3 left-3 text-3xl">
            <ArrowBackIcon />
          </a>
        </Link>
        <h1 className="text-center text-black text-2xl font-bold">Redirecting to sign in…</h1>
        <p className="text-center text-black/70 mt-4">
          Account creation now lives on the main auth page so email verification uses one consistent flow.
        </p>
      </div>
    </div>
  );
}
