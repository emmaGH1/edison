import { beforeEach, afterEach, expect, test, vi } from "vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { syntheticEvidence } from "@/test/fixtures";
import { ResearchWorkspace } from "./workspace";
import { EquityChart } from "./equity-chart";
import { QuestionRouter } from "./question-router";
import { ThemeControl } from "@/components/theme-control";
const data = syntheticEvidence();
beforeEach(() => {
  window.history.replaceState({}, "", "/research");
  vi.stubGlobal(
    "matchMedia",
    vi.fn().mockImplementation((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
  vi.stubGlobal("requestAnimationFrame", (callback: FrameRequestCallback) => {
    callback(0);
    return 1;
  });
  Element.prototype.scrollIntoView = vi.fn();
  localStorage.clear();
  document.documentElement.classList.remove("dark");
});
afterEach(() => vi.unstubAllGlobals());
test("withheld state never substitutes metrics and retains method navigation", () => {
  render(
    <ResearchWorkspace
      state={{ status: "unavailable", reason: "withheld" }}
      initialView="comparison"
      initialFilter="all"
      jevEnabled={false}
    />,
  );
  expect(
    screen.getByRole("heading", { name: "Evidence publication is withheld." }),
  ).toBeInTheDocument();
  expect(screen.queryByRole("slider")).not.toBeInTheDocument();
  fireEvent.click(screen.getByRole("button", { name: "Inspect the method" }));
  expect(
    screen.getByRole("heading", { name: "The experiment, frozen before evaluation." }),
  ).toBeInTheDocument();
  expect(screen.getByText(/Scenario results are withheld/)).toBeInTheDocument();
});
test("all-trade audit filters and inspector maintain a stable event reference", () => {
  render(
    <ResearchWorkspace
      state={{ status: "available", evidence: data, publicationApproved: false }}
      initialView="audit"
      initialFilter="all"
      jevEnabled={false}
    />,
  );
  expect(screen.getByText("Showing 55 of 55 completed trades.")).toBeInTheDocument();
  fireEvent.click(screen.getAllByRole("button", { name: "Missed winners" })[1]);
  expect(screen.getByText("Showing 13 of 55 completed trades.")).toBeInTheDocument();
  expect(window.location.search).toContain("filter=missed_winners");
  const id = data.audit[22].event_id;
  fireEvent.click(screen.getByRole("button", { name: "Inspect event " + id }));
  expect(window.location.search).toContain(id);
  expect(screen.getByText(id, { selector: "code" })).toBeInTheDocument();
  expect(screen.getByRole("link", { name: "Export note" })).toHaveAttribute(
    "href",
    expect.stringContaining(id),
  );
});
test("chart controls and table expose actual observations without generated values", () => {
  render(<EquityChart evidence={data} />);
  const slider = screen.getByRole("slider", { name: "Chart observation date" });
  expect(slider).toHaveValue("48");
  fireEvent.click(screen.getByRole("button", { name: "Previous chart observation" }));
  expect(slider).toHaveValue("47");
  fireEvent.change(slider, { target: { value: "0" } });
  expect(screen.getByRole("button", { name: "Previous chart observation" })).toBeDisabled();
  expect(screen.getAllByText("$100,000")).toHaveLength(4);
  const toggle = screen.getByRole("button", { name: "Buy & hold" });
  fireEvent.click(toggle);
  expect(toggle).toHaveAttribute("aria-pressed", "false");
  expect(screen.getByText("Accessible data table · 49 observations")).toBeInTheDocument();
});
test("bounded question feedback routes only supported output", async () => {
  const navigate = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi
      .fn()
      .mockResolvedValue(
        new Response(JSON.stringify({ type: "route", intent: "comparison", engine: "jev" })),
      ),
  );
  render(<QuestionRouter enabled onNavigate={navigate} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Did AI help?" } });
  fireEvent.click(screen.getByRole("button", { name: "Find evidence" }));
  await screen.findByText("Compare policies");
  expect(navigate).toHaveBeenCalledWith({ view: "comparison" });
  expect(screen.getByText(/All numbers come from the frozen bundle/)).toBeInTheDocument();
});
test("ambiguous question presents explicit choices rather than an invented answer", async () => {
  const navigate = vi.fn();
  vi.stubGlobal(
    "fetch",
    vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          type: "choice",
          choices: ["missed_winners", "costs"],
          reason: "ambiguous",
        }),
      ),
    ),
  );
  render(<QuestionRouter enabled={false} onNavigate={navigate} />);
  fireEvent.change(screen.getByRole("textbox"), { target: { value: "Missed winners and costs" } });
  fireEvent.click(screen.getByRole("button", { name: "Find evidence" }));
  await screen.findByText("Which evidence do you mean?");
  expect(navigate).not.toHaveBeenCalled();
  fireEvent.click(screen.getAllByRole("button", { name: "Missed winners" })[1]);
  expect(navigate).toHaveBeenCalledWith({ view: "audit", filter: "missed_winners" });
});
test("light, dark and system choices update the document and stored preference", () => {
  render(<ThemeControl />);
  const select = screen.getByRole("combobox", { name: "Color theme" });
  fireEvent.change(select, { target: { value: "dark" } });
  expect(document.documentElement).toHaveClass("dark");
  expect(localStorage.getItem("edison-theme")).toBe("dark");
  fireEvent.change(select, { target: { value: "light" } });
  expect(document.documentElement).not.toHaveClass("dark");
  fireEvent.change(select, { target: { value: "system" } });
  expect(select).toHaveValue("system");
});
