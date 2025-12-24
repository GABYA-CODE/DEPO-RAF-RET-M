import Image from "next/image";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Typography from "@/components/ui/Typography";

export default function Home() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-50 font-sans dark:bg-black">
      <div className="flex min-h-screen w-full max-w-3xl flex-col items-center justify-center gap-8 py-32 px-16 bg-white dark:bg-black sm:items-center">
        <Typography variant="title" center>
          Welcome to My App
        </Typography>
        <Typography variant="paragraph" center>
          This is a beautiful app with reusable components
        </Typography>

        <Card className="w-full">
          <div className="flex flex-col gap-4">
            <h2 className="text-2xl font-semibold text-black dark:text-white">
              Get Started
            </h2>
            <p className="text-gray-600 dark:text-gray-400">
              Enter your name below to continue
            </p>
            <Input placeholder="Enter your name..." />
            <div className="flex gap-3">
              <Button variant="primary">Submit</Button>
              <Button variant="secondary">Cancel</Button>
            </div>
          </div>
        </Card>

        <Card className="w-full">
          <div className="flex flex-col gap-3">
            <h3 className="text-lg font-semibold text-black dark:text-white">
              Features
            </h3>
            <ul className="list-disc list-inside text-gray-700 dark:text-gray-300 space-y-2">
              <li>Reusable UI Components</li>
              <li>Dark Mode Support</li>
              <li>Tailwind CSS Styling</li>
            </ul>
          </div>
        </Card>
      </div>
    </div>
  );
}
