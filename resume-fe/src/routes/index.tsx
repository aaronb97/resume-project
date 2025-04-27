import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, FilePlus2, BarChart3 } from "lucide-react";

export const Route = createFileRoute("/")({
  component: RouteComponent,
});

const features = [
  {
    title: "Beat The Bots",
    description:
      "Optimize wording and structure to pass Applicant Tracking Systems with ease.",
    icon: Target,
  },
  {
    title: "Tailored For Every Role",
    description:
      "Instantly align your skills with any job description for maximum relevance.",
    icon: FilePlus2,
  },
  {
    title: "Data‑Driven Insights",
    description:
      "Leverage AI analytics to highlight your strongest accomplishments.",
    icon: BarChart3,
  },
] as const;

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 text-white flex flex-col">
      <motion.section
        className="flex flex-1 flex-col items-center justify-center text-center px-6"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className="text-5xl md:text-6xl font-extrabold tracking-tight drop-shadow-xl">
          Supercharge Your Resume
        </h1>

        <p className="mt-6 max-w-2xl text-lg md:text-2xl text-stone-300">
          Fine‑tune your resume with AI to maximize your chances of success and
          sail through ATS filters.
        </p>

        <Button
          asChild
          size="lg"
          className="mt-10 px-10 py-5 text-lg rounded-2xl shadow-2xl active:scale-95 transition-transform"
        >
          <Link to="/resumes/upload">Try Now</Link>
        </Button>
      </motion.section>

      <section className="py-16 bg-stone-900/70 backdrop-blur-md">
        <div className="mx-auto grid max-w-6xl gap-6 px-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map(({ title, description, icon: Icon }) => (
            <motion.div
              key={title}
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <Card className="bg-stone-800/60 backdrop-blur-lg rounded-2xl shadow-xl">
                <CardContent className="p-8 flex flex-col items-center text-center gap-4">
                  <Icon className="h-12 w-12" />
                  <h3 className="text-xl font-semibold">{title}</h3>
                  <p className="text-sm text-stone-300">{description}</p>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>
    </div>
  );
}

export default RouteComponent;
