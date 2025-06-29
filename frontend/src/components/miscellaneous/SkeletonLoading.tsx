import { Stack,SkeletonText } from "@chakra-ui/react";
const SkeletonLoading = () => {
  return (
    <Stack>
      <SkeletonText noOfLines={12} gap="4" height="30px"/>
    </Stack>
  );
};

export default SkeletonLoading;
