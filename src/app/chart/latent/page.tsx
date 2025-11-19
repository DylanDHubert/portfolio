import { Column, Heading, Text, Meta, Schema, Button } from "@once-ui-system/core";
import { baseURL, person } from "@/resources";
import { SphereVisualization } from "@/components/chart/SphereVisualization";

export async function generateMetadata() {
  return Meta.generate({
    title: "Latent Space Visualization",
    description: "Interactive visualization of hierarchical clustering in embedding space.",
    baseURL: baseURL,
    image: `/api/og/generate?title=${encodeURIComponent("Latent Space Visualization")}`,
    path: "/chart/latent",
  });
}

export default function LatentPage() {
  return (
    <Column as="section" maxWidth="m" horizontal="center" gap="m" style={{ padding: "24px 0" }}>
      <Schema
        as="webPage"
        baseURL={baseURL}
        path="/chart/latent"
        title="Latent Space Visualization"
        description="Interactive visualization of hierarchical clustering in embedding space"
      />
      
      <Column maxWidth="s" gap="16">
        <Button data-border="rounded" href="/chart" variant="tertiary" weight="default" size="s" prefixIcon="chevronLeft">
          Back to CHART
        </Button>
        <Heading variant="display-strong-m">Latent Space</Heading>
        <Text variant="body-default-l" onBackground="neutral-weak">
          Step through hierarchical clustering at different depths
        </Text>
      </Column>

      <SphereVisualization />
    </Column>
  );
}

