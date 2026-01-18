import { Metadata } from "next";

type Props = {
  children: React.ReactNode;
  params: Promise<{
    username: string;
  }>;
};

const layout = ({ children }: Props) => {
  return <>{children}</>;
};

export default layout;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { username } = await params;
  return {
    title: `${username}'s followers`,
    description: `${username}'s followers on Lore Graph`,
  };
}
