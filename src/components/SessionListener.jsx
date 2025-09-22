import { useSession } from "next-auth/react";
import { useEffect } from "react";

export default function SessionListener({ setLoginDone }) {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status === "authenticated") {
      setLoginDone(true);
    } else if (status === "unauthenticated") {
      setLoginDone(false);
    }
  }, [status, setLoginDone]);

  return null;
}
