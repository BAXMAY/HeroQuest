import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckCircle2, XCircle } from "lucide-react";
import { getDailyTriviaQuestion, submitTriviaAnswer } from "@/server/fns/games";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCelebrate } from "@/components/game/celebrate";
import { useSound } from "@/components/game/sound-provider";
import { cn } from "@heroquest/ui";

export const Route = createFileRoute("/_app/games/trivia")({
  component: TriviaPage,
});

const COUNTDOWN_SECONDS = 15;

function TriviaPage() {
  const queryClient = useQueryClient();
  const celebrate = useCelebrate();
  const sound = useSound();
  const question = useQuery({
    queryKey: ["daily-trivia"],
    queryFn: () => getDailyTriviaQuestion(),
  });
  const [chosenIndex, setChosenIndex] = useState<number | null>(null);
  const [remaining, setRemaining] = useState(COUNTDOWN_SECONDS);

  const submit = useMutation({
    mutationFn: submitTriviaAnswer,
    onSuccess: (result) => {
      if (result.correct) {
        sound.play("xp");
        celebrate.burst();
      } else {
        sound.play("reject");
      }
      queryClient.invalidateQueries({ queryKey: ["daily-state"] });
      queryClient.invalidateQueries({ queryKey: ["me"] });
    },
  });

  useEffect(() => {
    if (submit.data || chosenIndex !== null || !question.data) return;
    const t = setInterval(() => {
      setRemaining((s) => {
        if (s <= 1) {
          clearInterval(t);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => clearInterval(t);
  }, [question.data, chosenIndex, submit.data]);

  useEffect(() => {
    if (remaining === 0 && chosenIndex === null && question.data) {
      // Time up — submit a deliberately-wrong index for participation XP.
      setChosenIndex(-1);
      submit.mutate({ data: { questionId: question.data.id, chosenIndex: 99 % 4 } });
    }
  }, [remaining, chosenIndex, question.data, submit]);

  function onChoose(i: number) {
    if (chosenIndex !== null || !question.data) return;
    setChosenIndex(i);
    sound.play("click");
    submit.mutate({ data: { questionId: question.data.id, chosenIndex: i } });
  }

  if (question.isLoading) {
    return <p className="text-sm text-muted-foreground">Loading…</p>;
  }
  if (!question.data) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-4">
        <p className="text-center text-muted-foreground">
          No trivia question available today. The daily generator runs at midnight Bangkok time
          — check back later!
        </p>
        <Button asChild variant="outline">
          <Link to="/games">Back to games</Link>
        </Button>
      </div>
    );
  }

  const result = submit.data;
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="font-heading text-3xl">Daily Trivia</h1>
        {!result ? (
          <span className="rounded-full bg-flame/15 px-3 py-1 text-sm font-bold text-flame">
            {remaining}s
          </span>
        ) : null}
      </div>
      <Card>
        <CardContent className="p-6">
          <p className="font-heading text-xl">{question.data.question}</p>
        </CardContent>
      </Card>
      <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
        {question.data.options.map((opt, i) => {
          const isChosen = chosenIndex === i;
          const isCorrect = result ? result.correctIndex === i : null;
          return (
            <motion.button
              key={i}
              type="button"
              onClick={() => onChoose(i)}
              disabled={chosenIndex !== null}
              whileTap={{ scale: 0.97 }}
              className={cn(
                "flex items-center justify-between rounded-2xl border-2 bg-card p-4 text-left transition",
                result === undefined && "hover:border-primary",
                isChosen && !result && "border-primary",
                result && isCorrect && "border-magic bg-magic/10",
                result && isChosen && !isCorrect && "border-flame bg-flame/10",
              )}
            >
              <span className="font-semibold">{opt}</span>
              {result && isCorrect ? (
                <CheckCircle2 className="h-5 w-5 text-magic" />
              ) : result && isChosen && !isCorrect ? (
                <XCircle className="h-5 w-5 text-flame" />
              ) : null}
            </motion.button>
          );
        })}
      </div>
      {result ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <p className="font-heading text-lg">
              {result.correct ? "Correct!" : "Not quite — keep learning!"}
            </p>
            {question.data && result.explanation ? (
              <p className="text-sm text-muted-foreground">{result.explanation}</p>
            ) : null}
            <p className="text-sm font-bold text-magic">+{result.reward.xp} XP</p>
            <Button asChild className="mt-3 w-fit">
              <Link to="/games">Back to games</Link>
            </Button>
          </CardContent>
        </Card>
      ) : null}
    </div>
  );
}
