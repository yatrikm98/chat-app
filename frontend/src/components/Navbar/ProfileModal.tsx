import {  CloseButton, Dialog, Portal,Text,Image } from "@chakra-ui/react";
import {User} from '../../Interfaces/User'



interface ProfileModal {
  user: User | null;
  open: boolean;
  onClose: () => void;
}

const ProfileModal = ({ open, onClose, user }: ProfileModal) => {
  return (
    <Dialog.Root
      lazyMount
      open={open}
      onOpenChange={() => onClose()}
      placement="center"
      key="lg"
      size="lg"
    >
      <Portal>
        <Dialog.Backdrop />
        <Dialog.Positioner>
          <Dialog.Content minH="370px">
            <Dialog.Header>
              <Dialog.Title
                fontSize="40px"
                fontFamily="Work sans"
                w="100%"
                display="flex"
                justifyContent="center"
              >
                {user?.name}
              </Dialog.Title>
            </Dialog.Header>
            <Dialog.Body
              display="flex"
              flexDir="column"

              alignItems="center"
              gap="4"
            >
              <Image
                borderRadius="full"
                // marginBottom="0px"
                rounded="md"
                src={user?.pic}
                alt={user?.name}
                h="100%"
                w="50%"
              />
              <Text
                fontSize={{ base: "28px", md: "30px" }}
                fontFamily="Work sans"
              >
                Email:{user?.email}
              </Text>
            </Dialog.Body>
            <Dialog.CloseTrigger asChild>
              <CloseButton size="sm" />
            </Dialog.CloseTrigger>
          </Dialog.Content>
        </Dialog.Positioner>
      </Portal>
    </Dialog.Root>
  );
};

export default ProfileModal;
