"use client";

import type React from "react";

import { useState } from "react";
import { Loader2, AlertCircle } from "lucide-react";

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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { generateWithModel } from "./actions";
import {
  regularSystemPrompt,
  regularUserPrompt,
  tutorialSystemPrompt,
  tutorialUserPrompt,
} from "./prompts";

const models = [
  { id: "openai/gpt-4o-mini", name: "GPT-4o Mini" },
  { id: "openai/o3-mini", name: "o3 Mini" },
  { id: "google/gemini-2.0-flash-lite-001", name: "Gemini 2.0 Flash Lite" },
  { id: "google/gemini-2.0-flash-001", name: "Gemini 2.0 Flash" },
];

type ModelResult = {
  output: string;
  responseTime: number;
};

export default function LLMComparisonApp() {
  const [promptOption, setPromptOption] = useState("custom");
  const [systemPrompt, setSystemPrompt] = useState("");
  const [userPrompt, setUserPrompt] = useState("");
  const [model1, setModel1] = useState("openai/gpt-4o-mini");
  const [model2, setModel2] = useState("google/gemini-2.0-flash-lite-001");
  const [customApiKey, setCustomApiKey] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingModel1, setIsLoadingModel1] = useState(false);
  const [isLoadingModel2, setIsLoadingModel2] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [model1Error, setModel1Error] = useState<string | null>(null);
  const [model2Error, setModel2Error] = useState<string | null>(null);
  const [model1Result, setModel1Result] = useState<ModelResult | null>(null);
  const [model2Result, setModel2Result] = useState<ModelResult | null>(null);

  // Handle prompt option change
  const handlePromptOptionChange = (value: string) => {
    setPromptOption(value);

    if (value === "regular") {
      setSystemPrompt(regularSystemPrompt);
      setUserPrompt(regularUserPrompt);
    } else if (value === "tutorial") {
      setSystemPrompt(tutorialSystemPrompt);
      setUserPrompt(tutorialUserPrompt);
    } else {
      // Custom option - reset to empty
      setSystemPrompt("");
      setUserPrompt("");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Reset all states
    setIsLoading(true);
    setIsLoadingModel1(true);
    setIsLoadingModel2(true);
    setError(null);
    setModel1Error(null);
    setModel2Error(null);
    setModel1Result(null);
    setModel2Result(null);

    // Call model 1
    generateWithModel({
      systemPrompt,
      userPrompt,
      modelId: model1,
      customApiKey: customApiKey || undefined,
    })
      .then((result) => {
        setModel1Result(result);
      })
      .catch((error) => {
        console.error(`Error with model ${model1}:`, error);
        setModel1Error(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      })
      .finally(() => {
        setIsLoadingModel1(false);
      });

    // Call model 2
    generateWithModel({
      systemPrompt,
      userPrompt,
      modelId: model2,
      customApiKey: customApiKey || undefined,
    })
      .then((result) => {
        setModel2Result(result);
      })
      .catch((error) => {
        console.error(`Error with model ${model2}:`, error);
        setModel2Error(
          error instanceof Error ? error.message : "An unknown error occurred"
        );
      })
      .finally(() => {
        setIsLoadingModel2(false);
      });

    // Promise.allSettled to set overall loading state
    Promise.allSettled([
      generateWithModel({
        systemPrompt,
        userPrompt,
        modelId: model1,
        customApiKey: customApiKey || undefined,
      }),
      generateWithModel({
        systemPrompt,
        userPrompt,
        modelId: model2,
        customApiKey: customApiKey || undefined,
      }),
    ]).finally(() => {
      setIsLoading(false);
    });
  };

  // Check if any results are available to show the results card
  const showResults =
    model1Result || model2Result || model1Error || model2Error;

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
            <Tabs
              value={promptOption}
              onValueChange={handlePromptOptionChange}
              className="w-full"
            >
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="regular">Regular</TabsTrigger>
                <TabsTrigger value="tutorial">Tutorial</TabsTrigger>
                <TabsTrigger value="custom">Custom</TabsTrigger>
              </TabsList>
            </Tabs>

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

            <Accordion type="single" collapsible className="w-full">
              <AccordionItem value="api-key">
                <AccordionTrigger className="text-sm">
                  Advanced Settings
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-2 pt-2">
                    <Label htmlFor="apiKey">
                      OpenRouter API Key (optional)
                    </Label>
                    <Input
                      id="apiKey"
                      type="password"
                      placeholder="Enter your custom API key..."
                      value={customApiKey}
                      onChange={(e) => setCustomApiKey(e.target.value)}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      If provided, this will override the default API key.
                    </p>
                  </div>
                </AccordionContent>
              </AccordionItem>
            </Accordion>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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

      {showResults && (
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
                    {isLoadingModel1 ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : model1Error ? (
                      <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{model1Error}</AlertDescription>
                      </Alert>
                    ) : model1Result ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Response time: {model1Result.responseTime}ms
                        </div>
                        <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                          {model1Result.output}
                        </div>
                      </>
                    ) : null}
                  </div>
                  <div>
                    <h3 className="text-lg font-medium mb-2">{model2}</h3>
                    {isLoadingModel2 ? (
                      <div className="flex items-center justify-center p-8">
                        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                      </div>
                    ) : model2Error ? (
                      <Alert variant="destructive" className="mb-2">
                        <AlertCircle className="h-4 w-4" />
                        <AlertDescription>{model2Error}</AlertDescription>
                      </Alert>
                    ) : model2Result ? (
                      <>
                        <div className="text-sm text-muted-foreground mb-2">
                          Response time: {model2Result.responseTime}ms
                        </div>
                        <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                          {model2Result.output}
                        </div>
                      </>
                    ) : null}
                  </div>
                </div>
              </TabsContent>
              <TabsContent value="individual" className="mt-4 space-y-6">
                <div>
                  <h3 className="text-lg font-medium mb-2">{model1}</h3>
                  {isLoadingModel1 ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : model1Error ? (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{model1Error}</AlertDescription>
                    </Alert>
                  ) : model1Result ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-2">
                        Response time: {model1Result.responseTime}ms
                      </div>
                      <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                        {model1Result.output}
                      </div>
                    </>
                  ) : null}
                </div>
                <div>
                  <h3 className="text-lg font-medium mb-2">{model2}</h3>
                  {isLoadingModel2 ? (
                    <div className="flex items-center justify-center p-8">
                      <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                    </div>
                  ) : model2Error ? (
                    <Alert variant="destructive" className="mb-2">
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>{model2Error}</AlertDescription>
                    </Alert>
                  ) : model2Result ? (
                    <>
                      <div className="text-sm text-muted-foreground mb-2">
                        Response time: {model2Result.responseTime}ms
                      </div>
                      <div className="p-4 rounded-md bg-muted/50 whitespace-pre-wrap">
                        {model2Result.output}
                      </div>
                    </>
                  ) : null}
                </div>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
