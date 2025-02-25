import { Button } from "@shadcn/button";
import { APP_NAME } from "@constants/appConfig";

export default function Home() {
  return (
    <main>
      <div>
        <p>
          Welcome to <strong>{APP_NAME}</strong>
        </p>

        <Button>Subscribe</Button>
      </div>
    </main>
  );
}
