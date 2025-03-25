"use client";

import type React from "react";

import { useState } from "react";
import { Loader2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { generateWithModel } from "./actions";

const models = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "openai/o3-mini", name: "o3 Mini" },
  { id: "google/gemini-2.0-flash-lite-001", name: "Gemini 2.0 Flash Lite" },
];

type ModelResult = {
  output: string;
  responseTime: number;
};

export default function LLMComparisonApp() {
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [model1, setModel1] = useState("openai/gpt-4o-mini");
  const [model2, setModel2] = useState("google/gemini-2.0-flash-lite-001");
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{
    model1: ModelResult;
    model2: ModelResult;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Make parallel requests for both models
      const [model1Result, model2Result] = await Promise.all([
        generateWithModel({
          systemPrompt,
          userPrompt,
          modelId: model1,
        }),
        generateWithModel({
          systemPrompt,
          userPrompt,
          modelId: model2,
        }),
      ]);

      setResults({
        model1: model1Result,
        model2: model2Result,
      });
    } catch (error) {
      console.error("Error comparing models:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">
          LLM Output Comparison
        </h1>
        <p className="text-muted-foreground mt-2">
          Compare outputs from two different LLMs using the same prompts
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Prompt Configuration</CardTitle>
          <CardDescription>
            Enter your system and user prompts, then select the models to
            compare
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="systemPrompt">System Prompt</Label>
              <Textarea
                id="systemPrompt"
                placeholder="You are a helpful assistant..."
                value={systemPrompt}
                onChange={(e) => setSystemPrompt(e.target.value)}
                className="min-h-24"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="userPrompt" className="font-medium">
                User Prompt
              </Label>
              <Textarea
                id="userPrompt"
                placeholder="Write a short poem about artificial intelligence..."
                value={userPrompt}
                onChange={(e) => setUserPrompt(e.target.value)}
                className="min-h-24"
                required
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="model1">Model 1</Label>
                <Select value={model1} onValueChange={setModel1}>
                  <SelectTrigger id="model1">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="model2">Model 2</Label>
                <Select value={model2} onValueChange={setModel2}>
                  <SelectTrigger id="model2">
                    <SelectValue placeholder="Select model" />
                  </SelectTrigger>
                  <SelectContent>
                    {models.map((model) => (
                      <SelectItem key={model.id} value={model.id}>
                        {model.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Comparing...
                </>
              ) : (
                "Compare Models"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>

      {results && (
        <Card>
          <CardHeader>
            <CardTitle>Comparison Results</CardTitle>
            <CardDescription>
              Side-by-side comparison of model outputs and response times
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="side-by-side" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="side-by-side">Side by Side</TabsTrigger>
                <TabsTrigger value="individual">Individual</TabsTrigger>
              </TabsList>
              <TabsContent value="side-by-side" className="mt-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-lg font-medium mb-2">{model1}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      Response time: {results.model1.responseTime}ms
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                      {results.model1.output}
                    </div>
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{model2}</h3>
                    <div className="text-sm text-muted-foreground mb-2">
                      Response time: {results.model2.responseTime}ms
                    </div>
                    <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                      {results.model2.output}
                    </div>
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="individual" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">{model1}</h3>
                  <div className="text-sm text-muted-foreground mb-2">
                    Response time: {results.model1.responseTime}ms
                  </div>
                  <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                    {results.model1.output}
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{model2}</h3>
                  <div className="text-sm text-muted-foreground mb-2">
                    Response time: {results.model2.responseTime}ms
                  </div>
                  <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                    {results.model2.output}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
