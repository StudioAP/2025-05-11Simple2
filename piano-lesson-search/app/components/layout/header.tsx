// app/components/layout/header.tsx
'use client';
import React from 'react';
import Link from 'next/link';
// import { User } from '@supabase/supabase-js'; // User 型をコメントアウト
// import { createSupabaseBrowserClient } from '@/utils/supabase/client';
// import ThemeSwitcher from '@/components/theme-switcher'; // Assuming this exists or will be created
import { Button } from '@/components/ui/button';

const Header: React.FC = () => {
  // const supabase = createSupabaseBrowserClient();
  // const [user, setUser] = useState<User | null>(null); // useStateをコメントアウト
  const user = null; // user を常に null に設定

  // useEffect(() => { // useEffect全体をコメントアウト
    // const checkUser = async () => {
    //   const { data: { user: currentUser } } = await supabase.auth.getUser();
    //   setUser(currentUser);
    // };
    // checkUser();

    // const { data: authListener } = supabase.auth.onAuthStateChange(
    //   (_event, session) => {
    //     setUser(session?.user ?? null);
    //   }
    // );

    // return () => {
    //   authListener?.subscription.unsubscribe();
    // };
    // Placeholder user state
    // setTimeout(() => setUser({ id: '123', email: 'user@example.com' } as User), 1000); // 仮のUserオブジェクト
  // }, []);

  const handleLogout = async () => {
    // await supabase.auth.signOut();
    // setUser(null);
    // router.push('/');
    console.log('Logout action');
  };

  return (
    <header className="py-4 px-6 border-b">
      <div className="container mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          PianoLessons
        </Link>
        <nav className="flex items-center space-x-4">
          <Link href="/search" className="hover:underline">Search Lessons</Link>
          {/* <ThemeSwitcher /> */}
          {user ? (
            <>
              <Link href="/dashboard" className="hover:underline">Dashboard</Link>
              <Button onClick={handleLogout} variant="outline">Logout</Button>
            </>
          ) : (
            <>
              <Link href="/login"><Button variant="outline">Login</Button></Link>
              <Link href="/signup"><Button>Sign Up</Button></Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
};

export default Header;
