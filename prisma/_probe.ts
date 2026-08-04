import { clamp } from "@/lib/utils";
import { TREND } from "@/lib/domain/enums";

console.log("alias-ok", clamp(120), TREND.UP);
