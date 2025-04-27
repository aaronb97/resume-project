import { createFileRoute, Link } from "@tanstack/react-router";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { motion } from "framer-motion";
import { Target, FilePlus2, Eye } from "lucide-react";

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
    title: "Instant Preview",
    description:
      "Select the AI recommendations you like and watch your resume update in real time.",
    icon: Eye,
  },
] as const;

// Motion variants for staggered reveal
const container = {
  hidden: {},
  show: {
    transition: {
      staggerChildren: 0.15,
    },
  },
} as const;

const item = {
  hidden: { opacity: 0, y: 40 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } },
} as const;

function RouteComponent() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-stone-950 via-stone-900 to-stone-800 text-white flex flex-col overflow-x-hidden">
      {/* Dramatic blurred gradient behind the hero */}
      <motion.div
        className="absolute inset-0 -z-10 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1.2 }}
      >
        <div className="absolute -top-32 left-1/2 -translate-x-1/2 h-96 w-96 bg-fuchsia-600/40 rounded-full blur-[120px] rotate-45" />
        <div className="absolute top-1/3 right-20 h-72 w-72 bg-cyan-500/30 rounded-full blur-[100px]" />
      </motion.div>

      {/* HERO */}
      <motion.section
        className="flex flex-1 flex-col items-center justify-center text-center px-6 pt-32 pb-20 md:pt-40"
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <motion.h1
          className="text-5xl md:text-7xl font-extrabold tracking-tight drop-shadow-2xl"
          initial={{ scale: 0.9 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.3, duration: 0.7, ease: "easeOut" }}
        >
          Supercharge Your Resume
        </motion.h1>

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

      {/* FEATURES */}
      <motion.section
        className="py-24 bg-stone-900/70 backdrop-blur-md relative"
        variants={container}
        initial="hidden"
        whileInView="show"
        viewport={{ once: false, amount: 0.3 }}
      >
        <motion.div
          className="mx-auto grid max-w-6xl gap-8 px-6 sm:grid-cols-2 lg:grid-cols-3"
          variants={container}
        >
          {features.map(({ title, description, icon: Icon }) => (
            <motion.div
              key={title}
              variants={item}
              whileHover={{ scale: 1.05 }}
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
        </motion.div>
      </motion.section>
    </div>
  );
}

export default RouteComponent;
