import { render, screen } from "@testing-library/react";
import RootLayout from "./layout";

describe("RootLayout", () => {
  it("renders its children inside the document body", () => {
    render(
      <RootLayout params={Promise.resolve({})}>
        <p>child content</p>
      </RootLayout>
    );

    expect(screen.getByText("child content")).toBeInTheDocument();
  });
});
