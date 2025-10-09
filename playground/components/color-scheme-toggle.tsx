"use client";

import {
  useColorScheme,
  colorSchemes,
  ColorSchemeName,
} from "./color-scheme-provider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "./ui/button";

export function ColorSchemeToggle() {
  const { colorScheme, setColorScheme } = useColorScheme();

  return (
    <Select
      value={colorScheme}
      onValueChange={(value) => setColorScheme(value as ColorSchemeName)}
    >
      <SelectTrigger>
        <SelectValue />
      </SelectTrigger>
      <SelectContent className="w-[10px]">
        {Object.entries(colorSchemes).map(([scheme, color]) => (
          <SelectItem key={scheme} value={scheme}>
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: color }}
            />
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
