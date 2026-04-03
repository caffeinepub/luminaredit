import { useQuery } from "@tanstack/react-query";
import { useActor } from "./useActor";

export function useUserProfile() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["userProfile"],
    queryFn: async () => {
      if (!actor) return null;
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useProjects() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["projects"],
    queryFn: async () => {
      if (!actor) return [];
      try {
        const profile = await actor.getCallerUserProfile();
        if (!profile) return [];
        return actor.getProjectsByUser(
          ((profile as { userId?: unknown } & typeof profile)
            ?.userId as Parameters<typeof actor.getProjectsByUser>[0]) ??
            (profile as unknown as Parameters<
              typeof actor.getProjectsByUser
            >[0]),
        );
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching,
  });
}

export function useTemplates() {
  const { actor, isFetching } = useActor();
  return useQuery({
    queryKey: ["templates"],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getTemplatesByUsageCount(null);
    },
    enabled: !!actor && !isFetching,
  });
}
